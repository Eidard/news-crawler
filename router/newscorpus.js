const { Observable, from } = require('rxjs');
const { mergeAll } = require('rxjs/operators');
const request = require('request');
const fs = require('fs');
const archiver = require('archiver');
const Database = require('./../services/database');
const FileManager = require('./../services/file-manager');
const util = require('./util');

const database = new Database();
const fileManager = new FileManager();

function queryToSqlWhere(query, startDate, endDate) { //필터조건을 추가한다.
    let query_where = '';
    const keys = Object.keys(query);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const val = query[key];
        if (val != undefined && val != '')
            query_where += `${key}="${val}" AND `;
    }

    if (startDate != undefined && endDate != undefined && startDate != '' && endDate != '' && startDate <= endDate)
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

        var sql = `SELECT count(*) as count, sum(textsize) as fs, sum(textwc) as wc, sum(textsc) as sc, min(date) as minDate, max(date) as maxDate FROM ${database.TABLE_NAME} ${sqlWhere};`;
        database.query(connection, sql, null, dbQueryCallback);
    }

    const dbQueryCallback = function (connection, rows) {
        database.disconnect(connection, function () { });

        if (rows.length >= 0) {
            let keys = Object.keys(rows[0]);
            keys.forEach(key => {
                if (rows[0][key] == null)
                    rows[0][key] = 0;
            });
            reqCallback(0, rows[0]);
        } else {
            reqCallback(1, null);
        }
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
        if (rows.length < 1 || rows.length > 10000)
            reqCallback(1, null);

        let obsList = [];
        rows.forEach(row => {
            let dirpath;
            if (row.division != undefined && row.division != '')
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
        query = util.decodeQuery(req.query);
        
        let sqlQuery = {
            'newspaper': query.newsName,
            'category': query.newsCategory,
            'division': query.newsDivision
        };
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        getNewsCount(sqlQuery, startDate, endDate, function (err, result) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(result).end();
        });
    });

    app.get('/newscorpus/list', function (req, res) {
        console.log(req.route.path);
        query = util.decodeQuery(req.query);

        page = query.page;
        size = query.size;
        let sqlQuery = {
            'newspaper': query.newsName,
            'category': query.newsCategory,
            'division': query.newsDivision
        }
        startDate = query.startDate;
        endDate = query.endDate;
        getNewsList(page, size, sqlQuery, startDate, endDate, function (err, rows) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(rows).end();
        });
    });

    app.post('/newscorpus/download', function (req, res) {
        console.log(req.route.path);
        query = util.decodeQuery(req.query);

        startDate = query.startDate;
        endDate = query.endDate;

        let sqlQuery = {
            'newspaper': query.newsName,
            'category': query.newsCategory,
            'division': query.newsDivision
        }

        let sqlColumnMapper = {
            'newsName': 'newspaper',
            'newsCategory': 'category',
            'newsDivision': 'division',
            'newsId': 'id'
        };
        key = sqlColumnMapper[req.body.key];
        selectedItems = req.body.selectedItems;
        if (selectedItems == undefined || selectedItems.length == 0) {
            res.status(203).send().end();
            return;
        }

        getZipFile(sqlQuery, startDate, endDate, key, selectedItems, req.sessionID, function (err, filepath) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(filepath).end();
        });
    });
}