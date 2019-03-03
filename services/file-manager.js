/* AWS S3 */
const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');
const mkdirp = require('mkdirp');

class FileManager {

    constructor() {
        AWS.config.region = 'ap-northeast-2';
        this.s3 = new AWS.S3();
        this.params = {
            Bucket: 'cloud.ils.hansung.ac.kr',
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
        this.txtpath = 'resources/newsText';
    }

    putText(dirpath, filename, text, callback) {
        this.textToTextfile(dirpath, filename, text, localFilePath => {
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
}

module.exports = FileManager;