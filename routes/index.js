var fs = require('fs'),
	User = require('../models/user');

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
			},
		};

	//Index page route
	app.get('/(home)?', function(req, res){
		res.render('home', options);
	});

	app.post('/login', function(req, res) {
		User.findOne({ email: req.body.email }, function(err, user) {
			if(user) {
				user.comparePassword(req.body.password, function(err, isMatch) {
					if(err) { res.send(405); }
					if(isMatch) {
						res.render('../views/about.jade', options);
						return;
					}
					
					res.send({error: true, message: 'Error: invalid email or password'});
				});
			}
			else {
				res.send({error: true, message: 'Error: invalid email or password'});
			}
		});
	});

	//Route for the rest of the static landing pages
	app.get(/\/(login|signup|about)/, function(req, res, next) {
		if(fs.existsSync(app.get('views') + '/' + req.params + '.jade')) {
			res.render(app.get('views') + '/' + req.params, options);
		}
	});
}