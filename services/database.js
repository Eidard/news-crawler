/* Database */
const fs = require('fs');
const mysql = require('mysql'); //mysql DB 접근

let instance;

class Database {
    constructor() {
        if (instance) return instance;
        instance = this;

        const config = JSON.parse(fs.readFileSync(__dirname + '/../private/config.json')).db;

        this.pool = mysql.createPool({
            connectionLimit: 66, //AWS RDS max connection
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password
        });

        this.TABLE_NAME = "news";
        this.INSERT_SQL = `INSERT IGNORE INTO ${this.TABLE_NAME} (url, newspaper, category, division, date, title, texturl, textsize, textwc, textsc) VALUES ?`;
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
