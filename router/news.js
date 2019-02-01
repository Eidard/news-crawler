const Database = require('./../services/database');
const FileManager = require('./../services/file-manager');
const HeraldCrawler = require('./../crawlers/herald-crawler');
const JoongangCrawler = require('./../crawlers/joongang-crawler');
// const MkCrawler = require('./../crawlers/mk-crawler');
const ReutersCrawler = require('./../crawlers/reuters-crawler');

const database = new Database();
const fileManager = new FileManager();


/* HTTP GET Method's Functions */
function getNewsCount(reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        var sql = `SELECT id FROM ${database.TABLE_NAME};`;
        database.query(connection, sql, null, dbQueryCallback);
    }

    const dbQueryCallback = function (connection, rows) {
        database.disconnect(connection, function () { });
        if (rows.length > 0)
            reqCallback(0, rows.length);
        else
            reqCallback(1, null);
    }

    /* execute */
    database.connect(dbConnectCallback);
}

function getNewsList(page, size, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        const start = size * (page - 1);
        var sql = `SELECT id, url, newspaper, category, division, date, title, text FROM ${database.TABLE_NAME} ORDER BY date DESC LIMIT ${start}, ${size}`;
        database.query(connection, sql, null, dbQueryCallback);
    }

    const dbQueryCallback = function (connection, rows) {
        database.disconnect(connection, function () { });
        if (rows.length > 0)
            reqCallback(0, rows);
        else
            reqCallback(1, null);
    }

    /* execute */
    database.connect(dbConnectCallback);
}

function getNewsText(id, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        var sql = `SELECT text FROM ${database.TABLE_NAME} WHERE id=${id}`;
        database.query(connection, sql, null, dbQueryCallback);
    }

    const dbQueryCallback = function (connection, rows) {
        database.disconnect(connection, function () { });
        if (rows.length > 0) {
            let filename = rows[0].text;
            fileManager.getText(filename, text => reqCallback(0, text));
        } else {
            reqCallback(1, null);
        }
    }

    /* execute */
    database.connect(dbConnectCallback);
}


/* Router */
module.exports = function (app) {
    const newsNames = ['herald', 'joongang', 'mk', 'reuters'];
    const newsCrawlers = {
        'herald': (newsCategory, newsDivision, startDate, endDate) => { return new HeraldCrawler(newsCategory, newsDivision, startDate, endDate); },
        'joongang': (newsCategory, newsDivision, startDate, endDate) => { return new JoongangCrawler(newsCategory, newsDivision, startDate, endDate); },
        //'mk': (newsCategory, newsDivision, startDate, endDate) => { return new MkCrawler(newsCategory, newsDivision, startDate, endDate); },
        'reuters': (newsCategory, newsDivision, startDate, endDate) => { return new ReutersCrawler(newsCategory, newsDivision, startDate, endDate); }
    };

    for (let i = 0; i < newsNames.length; i++) {
        app.get(`/news/${newsNames[i]}`, function (req, res) {
            console.log(req.route.path);
            newsCategory = req.query.newsCategory;
            newsDivision = req.query.newsDivision;
            startDate = req.query.startDate;
            endDate = req.query.endDate;

            const reqCallback = function (err) {
                res.status((err) ? 203 : 200).end();
            };

            if (startDate.length == 0 || endDate.length == 0) {
                reqCallback(1);
                return;
            }

            newsCrawlers[newsNames[i]](newsCategory, newsDivision, startDate, endDate).updateCrawling(reqCallback);
        });
    }

    app.get('/news/count', function (req, res) {
        console.log(req.route.path);
        getNewsCount(function (err, count) {
            if (err) {
                res.status(203).end();
                return;
            }
            console.log(count);
            res.status(200).send(`${count}`).end();
        });
    });

    app.get('/news/list', function (req, res) {
        console.log(req.route.path);
        page = req.query.page;
        size = req.query.size;
        getNewsList(page, size, function (err, rows) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(rows).end();
        });
    });

    app.get('/news/content', function (req, res) {
        console.log(req.route.path);
        id = req.query.id;
        getNewsText(id, function (err, text) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(text).end();
        });
    });

}
