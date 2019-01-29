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
    }

    putText(filepath, filename, text, callback) {
        this.textToTextfile(filepath, filename, text, path => {
            callback();
     
            // S3 저장
            this.params.Key = `newsText/${filepath}/${filename}`;
            this.params.Body = fs.createReadStream(path);
            this.s3.upload(this.params, (err, result) => {
                callback(result.Location);
            });
        });
    }

    getText(filename, callback) {
        this.textFileToText(filename, data => {
            callback(data);
        });
    }

    textToTextfile(filepath, filename, text, callback) {
        const path = `./resources/newsText/${filepath}`;
        mkdirp(path, err => {
            fs.writeFile(`${path}/${filename}`, text, 'utf-8', err => {
                if (err) {
                    callback(null);
                } else {
                    callback(`${path}/${filename}`);
                }
            });
        });
    }

    textFileToText(filename, callback) {
        const path = `./resources/newsText/${filename}`;
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                callback(null);
            } else {
                callback(data);
            }
        });
    }
}

module.exports = FileManager;


/////////////////////////////////////DONWLOAD//////////////////////////////////
// const fs = require('fs'); //file write


// /**
//  * DB에 저장된 크롤링 결과 Text를 txt 파일로 저장
//  *
//  * @param {*} startDate 시작일 ex) 20181021
//  * @param {*} endDate 종료일 ex) 20181106
//  * @param {*} newspaper 뉴스 종류 ex) 'joongang'
//  * @param {*} categoryName 카테고리
//  * @param {*} divisionName 분류
//  */
// function downloadNewsText(startDate, endDate, newspaper, categoryName, divisionName) {
//     var route = "./resources/newsText/";

//     var sql = `SELECT * FROM ${database.TABLE_NAME} WHERE newspaper='${newspaper}' AND category='${categoryName}'`
//         + ` AND division='${divisionName}' AND date between '${startDate}' AND '${endDate}';`;

//     database.query(sql)
//         .then(rows => {
//             num = 0;

//             for (var i = 0; i < rows.length; i++) {
//                 title = newspaper + "_" + categoryName + "_" + divisionName + "_" + rows[i].DATE + "_" + num++ + ".txt";
//                 fs.writeFile(route + title, rows[i].NEWSTEXT, 'utf-8', function (e) {
//                     if (e)
//                         console.log(e);
//                     else
//                         console.log('01 WRITE DONE!');
//                 });
//             }

//             return database.close();
//         });
// }
