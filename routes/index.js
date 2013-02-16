var fs = require('fs');

/*
 * Static page route module
 */

exports.init = function init(app) {
	app.get('/', function(req, res){
	  res.render('index', { title: 'Scheduler' });
	});

	app.get(/\/(about|login)/, function(req, res, next) {
		console.log(req.params);
	  if(fs.existsSync(app.get('views') + '/' + req.params[0] + '.ejs')) {
	    res.render(app.get('views') + '/' + req.params[0]);
	  }
	  else {
	    res.render('error', { error: 'Page not found'});
	  }
	});
}