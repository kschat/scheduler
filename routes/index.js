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
					'js/libs/jquery/jquery-1.9.1.min.js',
					'js/libs/bootstrap/bootstrap-transition.js',
					'js/libs/bootstrap/bootstrap-collapse.js',
					'js/libs/bootstrap/bootstrap-modal.js',
				]
			},
		};

	//Index page route
	app.get('/(home)?', function(req, res){
		res.render('home', options);
	});

	//Route for the rest of the static landing pages
	app.get(/\/(login|signup|about)/, function(req, res, next) {
		if(fs.existsSync(app.get('views') + '/' + req.params + '.jade')) {
			res.render(app.get('views') + '/' + req.params, options);
		}
	});
}