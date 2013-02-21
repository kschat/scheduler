var fs = require('fs');

/*
 * Static page route module
 */

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
			title: 'Scheduler',
			isPage: true,
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
	app.get('/:page', function(req, res, next) {
		console.log(req.params.page);
		if(fs.existsSync(app.get('views') + '/' + req.params.page + '.jade')) {
			res.render(app.get('views') + '/' + req.params.page, options);
		}
		else {
			options.title = 'Scheduler - error',
			options.error = 'Page not found';

			res.render(app.get('views') + '/error.jade', options);
		}
	});
}