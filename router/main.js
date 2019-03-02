/* Router */
module.exports = function(app)
{
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/newscrawling', function(req, res) {
		res.render('newscrawling.ejs');
	});

	app.get('/newscorpus', function(req, res) {
		res.render('newscorpus.ejs');
	});
}
