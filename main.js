const express = require('express');
const session = require('express-session');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// 뷰 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// 리소스
app.use(express.static('public/css'));
app.use(express.static('public/newsText'));
app.use(express.static('public/sse', {
	setHeaders: function(res, path, stat) {
		res.set('Content-Type', 'text/event-stream')
	}
}));
// app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: 'abcd1234',
	resave: false,
	saveUninitialized: true
}));

// 라우팅 시작
const main_router = require('./router/main') (app);
const newscrawling_router = require('./router/newscrawling') (app);
const newscorpus_router = require('./router/newscorpus') (app);
const doccorpus_router = require('./router/doccorpus') (app);

// 서버 실행
const config = JSON.parse(fs.readFileSync(__dirname + '/private/config.json')).server;
const server = app.listen(config.port, function() {
	console.log(`server running port ${config.port}`);
});
