/* Database */
const mysql = require('mysql'); //mysql DB 접근


class Database {

    constructor() {
        this.pool = mysql.createPool({
            connectionLimit: 66, //AWS RDS max connection
            host: 'newsdatas.cwagwpenns80.ap-northeast-2.rds.amazonaws.com',
            user: 'root',
            password: 'csedbadmin',
            port: '3306',
            database: 'newsdatas'
        });

        this.TABLE_NAME = "news";
        this.INSERT_SQL = `INSERT IGNORE INTO ${this.TABLE_NAME} (url, newspaper, category, division, date, title, text) VALUES ?`;
    }

    connect(callback) {
        this.pool.getConnection(function (err, connection) { //on db connect
            if (err) throw err;
            console.log('db connected');
            callback(connection);
        });
    }

    disconnect(connection, callback) {
        connection.release();
        console.log('db disconnected');
        callback();
    }

    query(connection, sql, args, callback) {
        connection.query(sql, args, (err, rows, fields) => { //on query complete
            if (err) throw err;
            console.log(`query ${sql} executed`);
            callback(connection, rows);
        });
    }

    simpleQuery(sql, args, callback) { //위 세 개를 한번에 쓰기
        let database = this;
        this.connect(function (connection) {
            database.query(connection, sql, args, function (connection, rows) {
                database.disconnect(connection, function () { });
                callback();
            });
        });
    }

}


module.exports = Database;