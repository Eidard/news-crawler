/* Router */
module.exports = function(app)
{
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/newscrawling', function(req, res) {
		res.render('newscrawling.ejs');
	});

	app.get('/corpus', function(req, res) {
		res.render('corpus.ejs');
	});
}
