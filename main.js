var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// 라우팅 시작
var main_router = require('./router/main') (app);
var newscrawling_router = require('./router/newscrawling') (app);
var newscorpus_router = require('./router/newscorpus') (app);

// 뷰 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// 리소스
app.use(express.static('public'));

// 서버 실행
var server = app.listen(50000, function() {
	console.log('server running ...');
});
