var fs = require('fs');

/*
 * Static page route module
 */

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
			title: 'Scheduler',
			links: {
				styles: [
					'css/bootstrap.css',
					'css/bootstrap-responsive.css',
					'css/mainStyle.css',
				],
				scripts: [
					'js/jquery-1.9.1.min.js',
					'js/bootstrap-transition.js',
					'js/bootstrap-collapse.js',
					'js/bootstrap-modal.js',
				]
			},
		};

	//Index page route
	app.get('/(home)?', function(req, res){
		res.render('home', options);
	});

	//Route for any other static page
	app.get(/\/(about|login)/, function(req, res, next) {
		console.log(req.params);
	  if(fs.existsSync(app.get('views') + '/' + req.params[0] + '.ejs')) {
	    res.render(app.get('views') + '/' + req.params[0]);
	  }
	});
}