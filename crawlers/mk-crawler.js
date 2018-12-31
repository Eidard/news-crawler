const cheerio = require('cheerio'); //html 페이지 크롤링

const Crawler = require('./crawler');


////////////////////////////////매일경제////////////////////////////////////////////////////////////////////////

// /**
//  * 매일경제 뉴스 DB 업데이트
//  *
//  * @param {*} newsCategory (ex) "01"
//  * @param {*} endDate     (ex) "20181106"
//  */
// class MkCrawler extends Crawler { //미완

//     constructor() {
//         this.categoryId = {
//             'Biz&Company': '19',
//             'Tech': '20',
//             'Market': '21',
//             'Economy': '22',
//             'Seoul': '23',
//             'Asia': '25',
//             'Analysis': '26'
//         }
//     }
// }
// function mkUpdateCrawling(newsCategory, endDate, reqCallback) {
//     const newspaper = "mk";

//     /* Callback */
//     const dbConnectCallback = function (connection) {
//         // DB에 존재하는 최신 뉴스 검색
//         let sql = `SELECT date FROM ${database.TABLE_NAME} WHERE newspaper='${newspaper}' AND category='${newsCategory}'`
//             + ` ORDER BY date DESC;`;

//         database.query(connection, sql, null, dbQueryCallback);
//     }

//     const dbQueryCallback = function (connection, rows) {
//         database.disconnect(connection, function () { });

//         if (rows.length < 1) {
//             console.log('업데이트 전에 먼저 DB에 기본 데이터를 넣어주세요.');
//             reqCallback(1);
//             return;
//         }

//         // 최신 뉴스의 날짜 바인딩
//         startDate = rows[0].DATE;
//         console.log("standDate : " + startDate);

//         request("http://pulsenews.co.kr/list.php?sc=308000" + newsCategory, requestCallback);
//     }

//     const requestCallback = function (err, res, body) {
//         if (err) {
//             reqCallback(1);
//             return;
//         }

//         var $ = cheerio.load(body);
//         firstUrl = $('div').find(".art_txt").text().trim();

//         // 새로운 뉴스 크롤링
//         let lines = "";
//         let argList = [];
//         let listnum = 1;
//         mkTextCrawling(lines, argList, newspaper, newsCategory, listnum, firstUrl, startDate, database, crawlingCallback, reqCallback);
//     }

//     const crawlingCallback = function (lines, argList, newspaper, newsCategory, newstitle, newsUrl, newsDate, endDate, database) {
//         // 크롤링한 뉴스를 INSERT할 쿼리를 생성하여 콜렉션에 추가한다.
//         let newDate = newsDate;
//         console.log(newDate);
//         console.log("================================================================");
//         console.log(newspaper + newsCategory + newsDate);
//         console.log(newstitle);
//         console.log(newsUrl);
//         console.log("================================================================");

//         request(newsUrl, function (err, res, body) {
//             if (err) {
//                 reqCallback(1);
//                 return;
//             }

//             var $ = cheerio.load(body);
//             let newsText = $('div').find(".art_txt").text().trim();
//             let newsdatas = [newsUrl, newspaper, newsCategory, "", newsDate, newsText];

//             lines = lines + database.INSERT_SQL + '\n';
//             argList.push(newsdatas);

//             if (argList.length() > nnnnn) {
//                 //todo
//             }
//         });
//     }

//     /* execute */
//     database.connect(dbConnectCallback);
// }


// function mkTextCrawling(lines, argList, newspaper, newsCategory, listNum, firstUrl, endDate, database, crawlingCallback, reqCallback) {
//     var url = "http://pulsenews.co.kr/list.php?sc=308000" + newsCategory + "&no=" + firstUrl;
//     var nextUrl = firstUrl;
//     request(url, function (err, response, body) {
//         if (err) {
//             reqCallback(1);
//             return;
//         }

//         //TO DO url에서  데이터 뽑아내는것 수정하김
//         //############### newsUrl, newsdata를 찾아올 수 있도록 수정하기 ############################

//         var $ = cheerio.load(body);

//         var tit = $('#container_sub > div.s_left_content > div.article > ul > li:nth-child(' + listNum + ') > p.tit > a');
//         //  var newstitle, newsUrl, newsDate;
//         // $('#container_sub > div.s_left_content > div.article > ul > li:nth-child('+ listNum +') > p.tit').each(function(index, ele){
//         //   newstitle = $(thie).find('a').text().trim();
//         //   newsUrl = $(thie).find('a').attr("href");
//         //   newsDate = $(thie).find('a > span > .date').text().trim();
//         // });

//         var newstitle = $('p.tit>a').attr("href");
//         var newsUrl = $('p.tit>a').eq(1).attr("href");
//         var newsDate = $(tit).find('span').text();

//         //날짜 데이터 정형화 (2018.06.10 15:40 -> 20180610)
//         newsDate = newsDate.substring(0, 10);
//         newsDate = newsDate.replace(".", "");

//         console.log("newstitle : " + newstitle + " newsUrl : " + newsUrl);
//         console.log("newsDate : " + newsDate + " endDate : " + endDate);
//         console.log("\n" + listNum);
//         if (newsDate < endDate) { //크롤링 계속
//             if (listNum == 20) {
//                 newListNum = 1;
//                 nextUrl = newsUrl;
//             } else {
//                 newListNum = listNum + 1;
//             }

//             crawlingCallback(newspaper, newsCategory, newstitle, newsUrl, newsDate, endDate, database);
//             mkTextCrawling(newspaper, newsCategory, newListNum, nextUrl, endDate, database, callback, reqCallback); //###firstUrl######################
//         } else { //크롤링 종료
//             console.log("newsDate : " + newsDate + " end point!!!!!!!!!!!");
//             reqCallback(0);
//         }

//     });
// }


// module.exports = MkCrawler;