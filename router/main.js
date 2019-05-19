/* Router */
module.exports = function(app, conf)
{
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/newscrawling', function(req, res) {
		res.render('newscrawling.ejs');
	});

	app.get('/doccrawling', function(req, res) {
		res.render('doccrawling.ejs');
	});

	app.get('/newscorpus', function(req, res) {
		res.render('newscorpus.ejs');
	});

	app.get('/doccorpus', function(req, res) {
		res.render('doccorpus.ejs');
	});

}
