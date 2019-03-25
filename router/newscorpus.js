const { Observable, from } = require('rxjs');
const { mergeAll } = require('rxjs/operators');
const request = require('request');
const fs = require('fs');
const archiver = require('archiver');
const Database = require('./../services/database');
const FileManager = require('./../services/file-manager');

const database = new Database();
const fileManager = new FileManager();

function queryToSqlWhere(query, startDate, endDate) { //필터조건을 추가한다.
    let query_where = '';
    const keys = Object.keys(query);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = query[key];
        if (val != '')
            query_where += `${key}="${val}" AND `;
    }

    if (startDate != '' && endDate != '' && startDate <= endDate)
        query_where += `date BETWEEN "${startDate}" AND "${endDate}"`;

    if (query_where.length == 6)
        query_where = '';
    else if (query_where.endsWith('AND '))
        query_where = query_where.substr(0, query_where.length - 5);

    return query_where;
}

function listToSqlWhere(key, list) { //필터조건 내에서 검색할 항목을 추가한다.
    if (list == undefined || list.length == 0) return "";
    let query_where = '';
    for (let i = 0; i < list.length; i++)
        query_where += `${key}="${list[i]}" OR `;

    if (query_where.endsWith('OR '))
        query_where = query_where.substr(0, query_where.length - 4);

    return query_where;
}

/* HTTP GET Method's Functions */
function getNewsCount(query, startDate, endDate, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        let sqlWhere = queryToSqlWhere(query, startDate, endDate);
        if (sqlWhere.length != 0)
            sqlWhere = 'WHERE ' + sqlWhere;

        var sql = `SELECT id FROM ${database.TABLE_NAME} ${sqlWhere};`;
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
        let sqlWhere = queryToSqlWhere(query, startDate, endDate);
        if (sqlWhere.length != 0)
            sqlWhere = 'WHERE ' + sqlWhere;

        var sql = `SELECT * FROM ${database.TABLE_NAME} ${sqlWhere} ORDER BY date DESC LIMIT ${start}, ${size};`;
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

function getZipFile(query, startDate, endDate, key, selectedItems, sessionID, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        let sqlWhere = queryToSqlWhere(query, startDate, endDate);
        if (sqlWhere.length != 0)
            sqlWhere += ` AND (${listToSqlWhere(key, selectedItems)})`;
        else
            sqlWhere += listToSqlWhere(key, selectedItems);
        if (sqlWhere.length != 0)
            sqlWhere = 'WHERE ' + sqlWhere;

        var sql = `SELECT newspaper, category, division, date, title, texturl FROM ${database.TABLE_NAME} ${sqlWhere};`;
        console.log(sql);
        database.query(connection, sql, null, dbQueryCallback);
    }

    const dbQueryCallback = function (connection, rows) {
        database.disconnect(connection, function () { });
        if (rows.length < 1)
            reqCallback(1, null);

        let obsList = [];
        rows.forEach(row => {
            let dirpath;
            if (row.division != '')
                dirpath = `${sessionID}/${row.newspaper}/${row.category}/${row.division}`;
            else
                dirpath = `${sessionID}/${row.newspaper}/${row.category}`;

            let obs$ = Observable.create((reqObs) => {
                const handleError = (err) => {
                    obsList = [];
                    reqObs.complete();
                }

                request(row.texturl, (err, res, body) => {
                    if (err) {
                        console.log(err);
                        handleError();
                        return;
                    }

                    fileManager.textToTextfile(dirpath, `${row.date}-${row.title}.txt`, body, (path) => {
                        if (path == null) {
                            console.log('Fail to create text file');
                            handleError();
                            return;
                        }
                        reqObs.next(path);
                        reqObs.complete();
                    });
                });
            });
            obsList.unshift(obs$);
        }); //forEach

        const obsList$ = from(obsList);
        const reqs$ = obsList$.pipe(mergeAll());

        let pathList = [];
        reqs$.subscribe({
            next: path => { pathList.push(path); },
            error: err => { console.log(err); reqCallback(1, null); },
            complete: () => {
                if (pathList.length == 0) {
                    reqCallback(1, null);
                    return;
                }

                let zipfile = fs.createWriteStream(`${fileManager.publicpath}/${fileManager.txtpath}/${sessionID}.zip`);

                zipfile.on('close', () => {
                    console.log(`zip file Total ${archive.pointer()} Bytes`);
                    reqCallback(0, `${sessionID}.zip`);
                    pathList.forEach(path => {
                        fs.unlink(path, (err) => {});
                    });
                });

                let archive = archiver('zip', {
                    zlib: { level: 9 }
                });
                archive.pipe(zipfile);
                archive.directory(`${fileManager.publicpath}/${fileManager.txtpath}/${sessionID}`, false);
                archive.finalize();
            }
        }); //subscribe
    } //db query callback

    /* execute */
    fileManager.removeDir(sessionID, () => {
        database.connect(dbConnectCallback);
    });
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

    app.post('/newscorpus/download', function (req, res) {
        console.log(req.route.path);
        query = {
            'newspaper': req.query.newsName,
            'category': req.query.newsCategory,
            'division': req.query.newsDivision,
        }
        startDate = req.query.startDate;
        endDate = req.query.endDate;

        array = {
            'newsName': 'newspaper',
            'newsCategory': 'category',
            'newsDivision': 'division',
            'newsTitle': 'title'
        }
        key = array[req.body.key];
        selectedItems = req.body.selectedItems;
        if (selectedItems == undefined || selectedItems.length == 0) {
            res.status(203).send().end();
            return;
        }

        getZipFile(query, startDate, endDate, key, selectedItems, req.sessionID, function (err, filepath) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(filepath).end();
        });
    });
}