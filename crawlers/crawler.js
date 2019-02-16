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

    constructor(newspaper, newsCategory, newsDivision, startDate, endDate) {
        this.newspaper = newspaper;
        this.newsCategory = newsCategory;
        this.newsDivision = newsDivision;
        this.startDate = startDate;
        this.endDate = endDate;
        this.argList = [];
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
                    if (crawler.argList.length === 0) {
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

        let newsBoardUrl = this.getNewsBoardUrl(this.newsCategory, this.newsDivision, page);

        request(newsBoardUrl, function (err, res, body) {
            if (err) {
                crawler.argList = [];
                crawlObs.complete();
                return;
            }

            let rows = crawler.parsePage(body, page);
            let obsList = [];

            for (let i = 0; i < rows.length; i++) {
                let newsTitle = rows[i][0].replace(/\//g, '\|').replace(/\%/g, ' percent ').trim();//.replace(/\+/g, ' (plus) ').replace(/\%/g, ' percent ').trim();
                let newsUrl = rows[i][1];
                let newsDate = rows[i][2];

                console.log(`${page} page ... ${newsDate} in ${crawler.startDate} ~ ${crawler.endDate}`);
                if (newsDate >= crawler.startDate) { //크롤링 계속
                    if (newsDate <= crawler.endDate) {
                        let obs$ = Observable.create(function(reqObs) {
                            // 뉴스 본문 크롤링
                            request(newsUrl, function (err, res, body) {
                                if (err) {
                                    crawler.argList = [];
                                    reqObs.complete();
                                    return;
                                }
                                let dirname;
                                if (crawler.newsDivision != '-') {
                                    dirname = `${crawler.newspaper}/${crawler.newsCategory}/${crawler.newsDivision}`;
                                } else {
                                    dirname = `${crawler.newspaper}/${crawler.newsCategory}`;
                                }
                                let filename = `${newsDate}-${newsTitle}.txt`;
                                let newsText = crawler.makeLinesEndsWithClose(crawler.parseNewsText(body));
                                let textsize = Buffer.from(newsText).length;
                                let textwc = newsText.match(/\w+/g).length;
                                let textsc = newsText.match(/^.\w*/gm).length;
                                fileManager.putText(dirname, filename, newsText, (texturl) => {
                                    let news = [newsUrl, crawler.newspaper, crawler.newsCategory, crawler.newsDivision, newsDate, newsTitle, texturl, textsize, textwc, textsc];
                                    reqObs.next(news);
                                    reqObs.complete();
                                });
                            });
                        });
                        obsList.unshift(obs$);
                    }
                }
            } //for

            const obsList$ = from(obsList);
            const reqs$ = obsList$.pipe(mergeAll());

            let newsList = [];
            reqs$.subscribe({
                next: news => { newsList.push(news); },
                error: err => { console.log(err); reqCallback(1); },
                complete: () => {
                    crawlObs.next(newsList);

                    // 다음 페이지 크롤링
                    let minDate = rows[rows.length-1][2];

                    if (minDate > crawler.startDate)
                        crawler.crawling(page + 1, crawlObs);
                    else
                        crawlObs.complete();
                }
            });
        }); //request
    }

    makeLinesEndsWithClose(text) {
        let toks = text.split(/ +/g);
        if (toks.length == 0)
            return text;

        let textLines = '';
        let i;
        for (i = 0; i < toks.length - 1; i++) {
            let cur = toks[i].trim();
            if (cur.match(/.*[.?!][\)"'“]*$/) && toks[i+1].trim().match(/^[\("'“]*[A-Z].*/))
                textLines += (cur + '\r\n');
            else
                textLines += (cur + ' ');
        }
        return textLines + toks[i].trim();
    }

    getNewsBoardUrl(newsCategory, newsDivision, page) { console.log('abstract getNewsBoardUrl'); }

    parsePage(body, page) { console.log('abstract parsePage'); }

    parseNewsText(body) { console.log('abstract getNewsText'); }
}


module.exports = Crawler;
