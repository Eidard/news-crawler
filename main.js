var express = require('express');
var session = require('express-session');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

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
// app.use(bodyParser());
app.use(session({
	secret: 'abcd1234',
	resave: false,
	saveUninitialized: true
}));

// 라우팅 시작
var main_router = require('./router/main') (app);
var newscrawling_router = require('./router/newscrawling') (app);
var newscorpus_router = require('./router/newscorpus') (app);


// 서버 실행
var server = app.listen(50000, function() {
	console.log('server running ...');
});
