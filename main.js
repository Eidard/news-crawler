var express = require('express');
var app = express();

// 라우팅 시작
var main_router = require('./router/main') (app);
var news_router = require('./router/news') (app);

// 앱 세팅
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

// 서버 실행
var server = app.listen(50000, function() {
	console.log('server running ...');
});
