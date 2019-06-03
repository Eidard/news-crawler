const { Observable, from } = require('rxjs');
const { mergeAll } = require('rxjs/operators');
const request = require('request');
const fs = require('fs');
const archiver = require('archiver');
const S3Manager = require('./../services/s3-manager');
const FileManager = require('./../services/file-manager');

const s3Manager = new S3Manager();


/* HTTP GET Method's Functions */
function getDocCount(size, query, reqCallback) {
    let prefix = `${query.cloud}/`;
    s3Manager.getCount('doc', size, prefix, (result) => reqCallback(0, result));
}

function getDocList(startAfter, size, query, reqCallback) {
    let prefix = `${query.cloud}/`;

    s3Manager.getList('doc', size, prefix, startAfter, (data) => {
        if (data == null)
            reqCallback(1, null);
        else
            reqCallback(0, data);
    });
}

function getZipFile(query, key, selectedItems, sessionID, reqCallback) {
    // TODO: Archive selectedItems
    reqCallback(1, null);
    // reqCallback(0, `${sessionID}.zip`);
}


/* Router */
module.exports = function (app) {
    app.get('/doccorpus/count', function (req, res) {
        console.log(req.route.path);
        size = req.query.size;
        query = { 'cloud': req.query.cloud }

        getDocCount(size, query, function (err, result) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(result).end();
        });
    });

    app.get('/doccorpus/list', function (req, res) {
        console.log(req.route.path);
        startAfter = req.query.startAfter;
        size = req.query.size;
        query = { 'cloud': req.query.cloud }

        getDocList(startAfter, size, query, function (err, rows) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(rows).end();
        });
    });

    app.post('/doccorpus/download', function (req, res) {
        console.log(req.route.path);
        query = { 'cloud': req.query.cloud }
        key = req.body.key; //ids or cloud (array)
        selectedItems = req.body.selectedItems;
        if (selectedItems == undefined || selectedItems.length == 0) {
            res.status(203).send().end();
            return;
        }

        getZipFile(query, key, selectedItems, req.sessionID, function (err, filepath) {
            if (err) {
                res.status(203).end();
                return;
            }
            res.status(200).send(filepath).end();
        });
    });
}