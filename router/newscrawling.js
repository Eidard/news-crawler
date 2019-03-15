const HeraldCrawler = require('./../crawlers/herald-crawler');
const JoongangCrawler = require('./../crawlers/joongang-crawler');
// const MkCrawler = require('./../crawlers/mk-crawler');
const ReutersCrawler = require('./../crawlers/reuters-crawler');
const FileManager = require('./../services/file-manager');

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
            newsCategory = req.query.newsCategory;
            newsDivision = req.query.newsDivision;
            startDate = req.query.startDate;
            endDate = req.query.endDate;
            sessionId = req.sessionID;

            // response with pipe
            fileManager.updatePipe(sessionId, 0, 0, (path) => {
                if (path == null) {
                    res.status(203).end();
                    return;
                }
                res.status(200).end(`${sessionId}-newscrawling.php`);
            });

            newsCrawlers[newsNames[i]](newsCategory, newsDivision, startDate, endDate, sessionId)
                .updateCrawling(function(err) {
                    if (err) {
                        console.log('crawling stopped');
                    } else {
                        console.log('crawling done');
                    }
                });
        });
    }
}
