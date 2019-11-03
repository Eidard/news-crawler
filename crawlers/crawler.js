const { Observable, from } = require('rxjs'); //콜백관리
const { mergeAll } = require('rxjs/operators'); //콜백관리
const request = require('request'); //http request
const Buffer = require('buffer/').Buffer; //file byte size

const Database = require('./../services/database');
const FileManager = require('./../services/file-manager');

const database = new Database();
const fileManager = new FileManager();


/**
 * 실제 크롤링을 하는 추상 클래스
 * 매일경제 뉴스 크롤링 클래스, 헤럴드 뉴스 크롤링 클래스, 중앙 뉴스 크롤링 클래스가
 * 해당 클래스를 상속받아 가상함수를 구현한다.
 */
class Crawler {

    constructor(newspaper, newsCategory, newsDivision, startDate, endDate, sessionId) {
        this.newspaper = newspaper;
        this.newsCategory = newsCategory;
        this.newsDivision = newsDivision;
        this.startDate = startDate;
        this.endDate = endDate;
        this.argList = [];
        this.sessionId = sessionId;
    }

    /**
     * DB 업데이트
     * 
     * @param {*} reqCallback 
     */
    updateCrawling(reqCallback) {
        let crawler = this;

        /* Callback */
        const dbConnectCallback = function (connection) {
            // 새로운 뉴스 크롤링
            let obs$ = Observable.create(function(crawlObs) {
                crawler.crawling(1, crawlObs);
            });
            obs$.subscribe({
                // 뉴스 목록 추가
                next: newsList => crawler.argList = newsList.concat(crawler.argList),

                // 에러 처리 (server will stop)
                error: err => { console.log(err); reqCallback(1); },

                // DB에 저장
                complete: () => {
                    console.log(`total ${crawler.argList.length} added`);
                    if (crawler.argList.length == 0) {
                        reqCallback(1);
                        return;
                    }
                    database.simpleQuery(database.INSERT_SQL, [crawler.argList], function() { reqCallback(0); });
                }
            });
        };

        /* execute */
        database.connect(dbConnectCallback);
    }

    /**
     * 뉴스 크롤링
     * 현재 페이지의 뉴스 URL 바인딩
     * -> URL의 newsDate 비교 후
     * -> startDate ~ endDate 사이이면, 각 URL로 접속하여 NewsText 바인딩, observer.next(news)
     * -> 모든 URL의 newsDate가 startDate ~ endDate이면 다음 페이지에서 계속
     * -> 아니면 observer.complete()
     *
     * @param {*} page        뉴스 게시판 페이지 (1~)
     * @param {*} crawlObs    next, complete ...
     */
    crawling(page, crawlObs) {
        let crawler = this;

        // 분야, 분류, Page로 게시판의 URL 생성
        let newsBoardUrl = this.getNewsBoardUrl(this.newsCategory, this.newsDivision, page);
        if (newsBoardUrl == null) {
            crawler.argList = [];
            crawlObs.complete();
            return;
        }

        // 게시판의 URL에 연결
        request(newsBoardUrl, function (err, res, body) {
            if (err) {
                console.log(`fail to connect to url '${newsBoardUrl}'`);
                crawler.argList = [];
                crawlObs.complete();
                return;
            }

            // 게시판 HTML Body를 파싱하여 { 뉴스제목, URL, 날짜 } 리스트 추출
            let rows = crawler.parsePage(body, page);
            
            let obsList = []; //비동기 요청에 대한 콜백 함수를 저장할 리스트

            // 각 뉴스 URL에 연결하는 비동기 요청(Observable)들을 생성
            for (let i = 0; i < rows.length; i++) {
                let newsTitle = rows[i][0].replace(/\//g, '\|').replace(/\%/g, ' percent ').trim();
                let newsUrl = rows[i][1];
                let newsDate = rows[i][2];

                console.log(`${page} page ... ${newsDate} in ${crawler.startDate} ~ ${crawler.endDate}`);

                // startDate와 endDate 사이의 기간에 작성된 뉴스만 크롤링
                if (newsDate >= crawler.startDate && newsDate <= crawler.endDate) {

                    // 비동기 요청(Observable) 생성
                    let obs$ = Observable.create(function(reqObs) {

                        // 뉴스 본문 URL에 연결
                        request(newsUrl, function (err, res, body) {
                            if (err) {
                                reqObs.complete();
                                return;
                            }

                            /* 뉴스 메타데이터 생성 */

                            // 신문사, 분야, 분류로 저장할 경로이름 생성
                            let dirname;
                            if (crawler.newsDivision != '') {
                                dirname = `${crawler.newspaper}/${crawler.newsCategory}/${crawler.newsDivision}`;
                            } else {
                                dirname = `${crawler.newspaper}/${crawler.newsCategory}`;
                            }

                            let filename = `${newsDate}-${newsTitle}.txt`; //텍스트 파일이름
                            let newsText = crawler.makeLinesEndsWithClose(crawler.parseNewsText(body)); //뉴스 본문
                            let textsize = Buffer.from(newsText).length; //뉴스 본문 사이즈 (B)

                            let textwc = 0; //단어 수
                            let tmp = newsText.match(/\w+/g);
                            if (tmp != null)
                                textwc = tmp.length;

                            let textsc = 0; //문장 수
                            tmp = newsText.match(/^.\w*/gm);
                            if (tmp != null)
                                textsc = tmp.length;

                            /* 뉴스 본문, 메타데이터 저장 */

                            // 텍스트 파일로 저장 및 AWS S3에 업로드
                            fileManager.putText(dirname, filename, newsText, function (texturl) {
                                if (texturl == null) {
                                    console.log(`fail to upload text file '${filename}'`);
                                    reqObs.complete();
                                    return;
                                }

                                // 뉴스 본문 및 메타데이터 수집결과를 콜백으로 넘겨줌
                                let news = [newsUrl, crawler.newspaper, crawler.newsCategory, crawler.newsDivision, newsDate, newsTitle, texturl, textsize, textwc, textsc];
                                reqObs.next(news);
                                reqObs.complete();
                            });
                        });
                    });
                    obsList.unshift(obs$); //Observable을 리스트에 추가
                }
            } //for

            // Observable 콜백들(obsList)의 결과를 한 곳에서 받을 수 있도록 하나의 Observable(reqs)로 묶음
            const obsList$ = from(obsList);
            const reqs$ = obsList$.pipe(mergeAll());

            let newsList = []; //현재 Page의 게시판에서 모은 뉴스 리스트

            // Observable을 Subscribe하면, 여러 뉴스의 URL에 한번에 연결하고 뉴스 본문과 메타데이터를 수집함
            reqs$.subscribe({
                // 비동기 실행 중 next()가 호출되면 next:의 콜백이 실행된다.
                next: news => { newsList.push(news); },

                // 비동기 실행 중 에러가 발생하면 error:의 콜백이 실행되고 서버가 멈춤
                error: err => { console.log(err); reqCallback(1); },

                // obsList에 포함되었던 모든 Observable이 complete() 호출을 완료하면 complete:의 콜백이 실행된다.
                complete: () => {
                    crawlObs.next(newsList); //현재 Page에서 모은 뉴스 리스트를 전체 뉴스 리스트에 추가

                    // 클라이언트 측에 현재 크롤링 진행상황을 알려주기 위해 Pipe 역할을 하는 파일 내용을 수정
                    let pipeRow = {
                        "newspaper": crawler.newspaper, "newsCategory": crawler.newsCategory, "newsDivision": crawler.newsDivision,
                        "startDate": crawler.startDate, "endDate": crawler.endDate,
                        "percent": 100, "total": crawler.argList.length
                    };

                    if (rows.length == 0) { //수집된 뉴스가 없는 경우(수집완료)
                        fileManager.updatePipe(crawler.sessionId, pipeRow, (path, exist) => {});
                        crawlObs.complete();
                        return;
                    }

                    const minDate = rows[rows.length-1][2]; //수집된 뉴스 중 가장 오래된 뉴스의 날짜

                    if (crawler.sessionId != null || crawler.sessionId != undefined) {
                        const percent = crawler.getDatePercentage(minDate);
                        pipeRow.percent = percent;
                        fileManager.updatePipe(crawler.sessionId, pipeRow, (path, exist) => {});
                    }

                    // minDate가 startDate 보다 이후이면 다음 페이지 크롤링
                    if (minDate >= crawler.startDate)
                        crawler.crawling(page + 1, crawlObs);
                    else
                        crawlObs.complete(); //크롤링 종료
                }
            });
        }); //request
    }

    makeLinesEndsWithClose(text) { //article 한 줄에 한 문장있도록 함
        text = text.replace(/[`＇❛❜‘’]/g, `'`).replace(/[＂❝❞“”]/g, `"`);
        let toks = text.split(/ +/g);
        if (toks.length == 0)
            return text;

        let textLines = '';
        let i;
        for (i = 0; i < toks.length - 1; i++) {
            let cur = toks[i].trim();
            if (cur.match(/.*[.?!][\)"']*$/) && toks[i+1].trim().match(/^[\("']*[A-Z].*/))
                textLines += (cur + '\r\n');
            else
                textLines += (cur + ' ');
        }
        return textLines + toks[i].trim();
    }

    getDatePercentage(curDate) {
        if (curDate > this.endDate) return 0;
        if (curDate <= this.startDate) return 100;

        const splitDate = (date) => { return [date.substring(0, 4), date.substring(5, 7), date.substring(8, 10)]; }
        const subDate = (s, e) => { return (e[2] - s[2]) * 1 + (e[1] - s[1]) * 31 + (e[0] - s[0]) * 365; }
        const s = splitDate(this.startDate);
        const c = splitDate(curDate);
        const e = splitDate(this.endDate);

        const total = subDate(s, e);
        if (total == 0)
            return 0;

        const cur = subDate(c, e);
        return cur * 100 / total;
    }

    getNewsBoardUrl(newsCategory, newsDivision, page) { console.log('abstract function getNewsBoardUrl'); }

    parsePage(body, page) { console.log('abstract function parsePage'); }

    parseNewsText(body) { console.log('abstract function getNewsText'); }
}


module.exports = Crawler;
