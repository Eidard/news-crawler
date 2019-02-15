/* Router */
module.exports = function(app)
{
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/crawling', function(req, res) {
		res.render('crawling.html');
	});

	app.get('/corpus', function(req, res) {
		res.render('corpus.html');
	});
}
