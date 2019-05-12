/* AWS S3 */
const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

class FileManager {

    constructor() {
        const config = JSON.parse(fs.readFileSync(__dirname + '/../private/config.json')).s3;
        AWS.config.loadFromPath(__dirname + '/../private/credentials.json');

        this.s3 = new AWS.S3();
        this.params = {
            Bucket: config.Bucket,
            Key: null,
            ACL: 'public-read',
            Body: null
        };
        this.form = new formidable.IncomingForm({
            encoding: 'utf-8',
            multiples: true,
            keepExtensions: false
        });
        this.publicpath = './public';
        this.txtpath = 'newsText';
        this.ssepath = 'sse';
    }

    putText(dirpath, filename, text, callback) {
        this.textToTextfile(dirpath, filename, text, (localFilePath) => {
            if (localFilePath == null) {
                console.log(`fail to create text file '${filename}'`);
                callback(null);
                return;
            }

            // S3 저장
            this.params.Key = `${dirpath}/${filename}`;
            this.params.Body = fs.createReadStream(localFilePath);
            this.s3.upload(this.params, (err, data) => {
                fs.unlink(localFilePath, (err) => {});
                if (data != undefined)
                    callback(data.Location);
                else {
                    console.log(err);
                    callback(null);
                }
            });
        });
    }

    textToTextfile(dirpath, filename, text, callback) {
        mkdirp(`${this.publicpath}/${this.txtpath}/${dirpath}`, (err) => {
            const path = `${this.publicpath}/${this.txtpath}/${dirpath}/${filename}`;
            fs.writeFile(path, text, 'utf-8', (err1) => {
                if (err1) {
                    console.log(err1);
                    callback(null);
                } else {
                    callback(path);
                }
            });
        });
    }

    updatePipe(sessionId, row, callback) {
        mkdirp(`${this.publicpath}/${this.ssepath}`, (err) => {
            const path = `${this.publicpath}/${this.ssepath}/${sessionId}-newscrawling.php`;
            let exist = false;
            fs.readFile(path, 'utf-8', (err1, data) => {
                let rows = [];
                let index = 0;
                if (err1) {
                    console.log('create new pipe ...');
                } else {
                    try {
                        rows = JSON.parse(data.split('data: ')[1]);
                    } catch(err) {
                        console.log('fail to parsing json. updating pipe is aborted.');
                        callback(null, null);
                        return;
                    }
                    index = rows.length;
                    for (let i = 0; i < rows.length; i++) {
                        exist = row.newspaper == rows[i].newspaper
                            && row.newsCategory == rows[i].newsCategory
                            && row.newsDivision == rows[i].newsDivision
                            && row.startDate == rows[i].startDate
                            && row.endDate == rows[i].endDate;
                        if (exist) {
                            index = i;
                            break;
                        }
                    }
                }

                if (rows.length == index) {
                    rows.push(row);
                } else {
                    if (row.percent >= rows[index].percent)
                        rows[index] = row;
                }

                const text = `data: ${JSON.stringify(rows)}\n\n`;

                fs.writeFile(path, text, 'utf-8', (err2) => {
                    if (err2) {
                        console.log(err2);
                        callback(null, null);
                    } else {
                        callback(path, exist);
                    }
                });
            });
        });
    }

    removeDir(dirpath, callback) {
        rimraf(`${this.publicpath}/${this.txtpath}/${dirpath}`, (err) => {
            callback();
        });
    }
}

module.exports = FileManager;