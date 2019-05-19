/* AWS S3 */
const AWS = require('aws-sdk');
const fs = require('fs');

let instance;
let buckets = JSON.parse(fs.readFileSync(__dirname + '/../private/config.json')).s3;

class S3Manager {
    constructor() {
        if (instance) return instance;
        instance = this;

        AWS.config.loadFromPath(__dirname + '/../private/credentials.json');

        this.s3 = new AWS.S3();
    }

    getCount(bucketId, maxKeys, prefix, callback) {
        let sum = 0;
        let startKeys = [];

        let params = {
            Bucket: buckets[bucketId],
            MaxKeys: maxKeys,
            Prefix: prefix
        };
        this.s3.listObjectsV2(params)
            .eachPage(function(err, data, doneCallback) {
                if (err || data == null || data.KeyCount == 0) {
                    callback({ "count": sum, "startKeys": startKeys });
                    return;
                }
                if (sum == 0)
                    startKeys.push('');
                startKeys.push(data.Contents[data.KeyCount - 1].Key);
                sum += data.KeyCount;
                doneCallback();
            });
    }

    getList(bucketId, maxKeys, prefix, startAfter, callback) {
        console.log(startAfter);
        let params = {
            Bucket: buckets[bucketId],
            EncodingType: "url",
            MaxKeys: maxKeys,
            Prefix: prefix,
        }
        if (startAfter != '')
            params['StartAfter'] = startAfter;

        this.s3.listObjectsV2(params, function(err, data) {
            callback(data);
        });
    }
}

module.exports = S3Manager;