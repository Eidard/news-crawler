const Database = require('./../services/database');

const database = new Database();

function queryToSqlWhere(query, startDate, endDate) {
    let query_where = 'WHERE ';
    const keys = Object.keys(query);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = query[key];
        if (val != '')
            query_where += `${key}='${val}' AND `;
    }

    if (startDate != '' && endDate != '' && startDate <= endDate)
        query_where += `date BETWEEN '${startDate}' AND '${endDate}'`;

    if (query_where.length == 6)
        query_where = '';
    else if (query_where.endsWith('AND '))
        query_where = query_where.substr(0, query_where.length - 5);

    return query_where;
}

/* HTTP GET Method's Functions */
function getNewsCount(query, startDate, endDate, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        var sql = `SELECT id FROM ${database.TABLE_NAME} ${queryToSqlWhere(query, startDate, endDate)};`;
        database.query(connection, sql, null, dbQueryCallback);
    }

    const dbQueryCallback = function (connection, rows) {
        database.disconnect(connection, function () { });
        if (rows.length >= 0)
            reqCallback(0, rows.length);
        else
            reqCallback(1, null);
    }

    /* execute */
    database.connect(dbConnectCallback);
}

function getNewsList(page, size, query, startDate, endDate, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        if (page < 1) page = 1;
        const start = size * (page - 1);
        var sql = `SELECT * FROM ${database.TABLE_NAME} ${queryToSqlWhere(query, startDate, endDate)} ORDER BY date DESC LIMIT ${start}, ${size};`;
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

/* Router */
module.exports = function (app) {
    app.get('/newscorpus/count', function (req, res) {
        console.log(req.route.path);
        query = {
            'newspaper': req.query.newsName,
            'category': req.query.newsCategory,
            'division': req.query.newsDivision,
        }
        startDate = req.query.startDate;
        endDate = req.query.endDate;

        getNewsCount(query, startDate, endDate, function (err, count) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(`${count}`).end();
        });
    });

    app.get('/newscorpus/list', function (req, res) {
        console.log(req.route.path);
        page = req.query.page;
        size = req.query.size;
        query = {
            'newspaper': req.query.newsName,
            'category': req.query.newsCategory,
            'division': req.query.newsDivision,
        }
        startDate = req.query.startDate;
        endDate = req.query.endDate;

        getNewsList(page, size, query, startDate, endDate, function (err, rows) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(rows).end();
        });
    });
}