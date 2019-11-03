const HeraldCrawler = require('./../crawlers/herald-crawler');
const JoongangCrawler = require('./../crawlers/joongang-crawler');
// const MkCrawler = require('./../crawlers/mk-crawler');
const ReutersCrawler = require('./../crawlers/reuters-crawler');
const FileManager = require('./../services/file-manager');
var util = require('./util');

const fileManager = new FileManager();

/* Router */
module.exports = function (app) {
    const newsNames = ['herald', 'joongang', 'mk', 'reuters'];
    const newsCrawlers = {
        'herald': (newsCategory, newsDivision, startDate, endDate, sessionId) => { return new HeraldCrawler(newsCategory, newsDivision, startDate, endDate, sessionId); },
        'joongang': (newsCategory, newsDivision, startDate, endDate, sessionId) => { return new JoongangCrawler(newsCategory, newsDivision, startDate, endDate, sessionId); },
        //'mk': (newsCategory, newsDivision, startDate, endDate, sessionId) => { return new MkCrawler(newsCategory, newsDivision, startDate, endDate, sessionId); },
        'reuters': (newsCategory, newsDivision, startDate, endDate, sessionId) => { return new ReutersCrawler(newsCategory, newsDivision, startDate, endDate, sessionId); }
    };

    for (let i = 0; i < newsNames.length; i++) {
        app.get(`/newscrawling/${newsNames[i]}`, function (req, res) {
            console.log(req.route.path);
            let query = util.decodeQuery(req.query);
            sessionId = req.sessionID;

            // response with pipe
            let pipeRow = {
                "newspaper": newsNames[i], "newsCategory": query.newsCategory, "newsDivision": query.newsDivision,
                "startDate": query.startDate, "endDate": query.endDate,
                "percent": 0, "total": 0
            };
            fileManager.updatePipe(sessionId, pipeRow, (path, exist) => {
                if (path == null) {
                    res.status(203).end();
                    return;
                }
                res.status(200).end(`${sessionId}-newscrawling.php`);

                if (exist) return; //이미 같은 세션에서 같은 크롤링 요청을 처리 중인 파이프가 존재하면 새로 크롤링하지 않는다.

                newsCrawlers[newsNames[i]](pipeRow.newsCategory, pipeRow.newsDivision, pipeRow.startDate, pipeRow.endDate, sessionId)
                    .updateCrawling(function(err) {
                        if (err) {
                            console.log('crawling stopped');
                            pipeRow.percent = 100;
                            fileManager.updatePipe(sessionId, pipeRow, (path, exist) => {});
                        } else {
                            console.log('crawling done');
                        }
                    });
            });
        });
    }
}
