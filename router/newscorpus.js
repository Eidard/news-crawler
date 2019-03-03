const { Observable, from } = require('rxjs');
const { mergeAll } = require('rxjs/operators');
const request = require('request');
const fs = require('fs');
const archiver = require('archiver');
const Database = require('./../services/database');
const FileManager = require('./../services/file-manager');

const database = new Database();
const fileManager = new FileManager();

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

function getZipFile(query, startDate, endDate, sessionID, reqCallback) {
    /* Callback */
    const dbConnectCallback = function (connection) {
        var sql = `SELECT newspaper, category, division, title, texturl FROM ${database.TABLE_NAME} ${queryToSqlWhere(query, startDate, endDate)};`;
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

                    fileManager.textToTextfile(dirpath, `${row.title}.txt`, body, (path) => {
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
                    reqCallback(0, `${fileManager.txtpath}/${sessionID}.zip`);
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

    app.get('/newscorpus/download', function (req, res) {
        console.log(req.route.path);
        query = {
            'newspaper': req.query.newsName,
            'category': req.query.newsCategory,
            'division': req.query.newsDivision,
        }
        startDate = req.query.startDate;
        endDate = req.query.endDate;

        getZipFile(query, startDate, endDate, req.sessionID, function (err, filepath) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(filepath).end();
        });
    });
}