var mongoose = require('mongoose'),
	User = require('../models/user');

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
		title: 'Scheduler',
		isPage: true,
		loggedIn: false,
		searchOn: true,
		//userName: 'dev', //remove for production
		links: {
			styles: [
				'/css/bootstrap.css',
				'/css/bootstrap-responsive.css',
				'/css/mainStyle.css',
				'/css/font-awesome.min.css',
			],
		},
	};

	//user schedule route
	app.get(/^\/user\/([0-9a-zA-Z]+)\/schedules\/?$/, function(req, res) {
		if(!req.session.loggedIn) {
			res.redirect('login');
			return;
		}
		options.loggedIn = req.session.loggedIn;
		options.userName = req.params[0];
		options.currUser = req.session.user.userName;
		res.render(app.get('views') + '/user/schedules', options);
	});

	//user profile route
	app.get(/^\/user\/([0-9a-zA-Z]+)\/?$/, function(req, res) {
		if(!req.session.loggedIn) {
			res.redirect('login');
			return;
		}
		User.findOne({ userName: req.params[0] }, function(err, user) {
			if(user) {
				options.loggedIn = req.session.loggedIn;
				options.userName = req.params[0];
				options.currUser = req.session.user.userName;
				res.render(app.get('views') + '/user/profile', options);
			}
			else {
				options.error = 'User not found';
				res.render(app.get('views') + '/error', options);
			}
		});
	});

	//makes sure users are authorized to edit a profile
	app.put(/^\/user\/([0-9a-zA-Z]+)\/authUpdate\/?$/, function(req, res) {
		if(!req.session.loggedIn) {
			res.redirect('login');
			return;
		}
		else if(req.session.user._id !== req.body._id) {
			console.log('not auth');
			res.send(403);
		}
		else {
			console.log('auth');
			res.redirect('/api/user/' + req.params[0] + '');
		}
	});
};