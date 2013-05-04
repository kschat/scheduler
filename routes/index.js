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
		loggedIn: false,
		searchOn: false,
		links: {
			styles: [
				'css/bootstrap.css',
				'css/bootstrap-responsive.css',
				'css/mainStyle.css',
				'/css/font-awesome.min.css',
			],
		},
	};

	//Index page route
	app.get('/(home)?', function(req, res) {
		options.loggedIn = req.session.loggedIn || false;
		options.currUser = req.session.user ? req.session.user.userName : '';
		res.render('home', options);
	});

	//Login route
	app.post('/login', function(req, res) {
		User.findOne({ email: req.body.email }, function(err, user) {
			if(user) {
				user.comparePassword(req.body.password, function(err, isMatch) {
					if(err) { res.send(405); }
					if(isMatch) {
						req.session.loggedIn = true;
						req.session.user = user;
						
						res.send({ error: false, user: user });
						return;
					}
					req.session.loggedIn = false;
					res.send({error: true, message: 'Invalid email or password'});
				});
			}
			else {
				req.session.loggedIn = false;
				res.send({error: true, message: 'Invalid email or password'});
			}
		});
	});

	app.get('/logincheck', function(req, res) {
		User.findOne({ email: req.query.email }, function(err, user) {
			if(user) {
				user.comparePassword(req.query.password, function(err, isMatch) {
					if(err) { res.send(405); }
					if(isMatch) {
						req.session.loggedIn = true;
						req.session.user = user;
						
						res.redirect('/user/' + user.userName);
						return;
					}
					req.session.loggedIn = false;
					res.send({error: true, message: 'Invalid email or password'});
				});
			}
			else {
				req.session.loggedIn = false;
				res.send({error: true, message: 'Invalid email or password'});
			}
		});
	});

	//logout route
	app.get('/logout', function(req, res) {
		req.session.loggedIn = false;
		req.session.user = null;
		res.redirect('/');
	});

	//about route
	app.get('/about', function(req, res) {
		options.loggedIn = req.session.loggedIn || false;
		options.currUser = req.session.user ? req.session.user.userName : '';
		res.render(app.get('views') + '/about', options);
	});

	//login and signup route
	app.get(/\/(login|signup)/, function(req, res, next) {
		if(req.session.loggedIn) {
			res.redirect('/user/' + req.session.user.userName);
		}
		else {
			options.loggedIn = req.session.loggedIn || false;
			if(fs.existsSync(app.get('views') + '/' + req.params + '.jade')) {
				res.render(app.get('views') + '/' + req.params, options);
			}
		}
	});
}