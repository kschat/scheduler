var Course = require('../models/course');

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
		title: 'Scheduler',
		isPage: true,
		loggedIn: false,
		searchOn: false,
		userName: 'dev', //remove for production,
		currUser: 'kschat', //remove for production
		links: {
			styles: [
				'/css/bootstrap.css',
				'/css/bootstrap-responsive.css',
				'/css/mainStyle.css',
				'/css/font-awesome.min.css',
			],
		},
	};

	//Route for searching courses
	app.get(/^\/courses\/search(?:\/[\-a-zA-Z0-9]+\/page\/[\-0-9]+)?\/?$/, function(req, res) {
		//if(!req.session.loggedIn) {
		//	res.redirect('login');
		//	return;
		//}
		options.searchOn = false;
		options.loggedIn = req.session.loggedIn;
		//options.userName = req.session.user.userName;
		res.render(app.get('views') + '/course/advanced-search', options);
	});

	//route for individual course pages
	app.get(/^\/courses\/([a-zA-Z]{3}[0-9]{3})\/?$/, function(req, res) {
		Course.find({ courseNumber: req.params[0].toUpperCase() }, function(err, courses) {
			if(err) { res.send(405); }

			if(courses.length) {
				options.searchOn = true;
				options.courseTitle = courses[0].courseTitle;
				options.courseCredits = courses[0].credits;
				options.courses = courses;
				
				res.render(app.get('views') + '/course/course', options);
			}
			else {
				options.error = 'course not found';
				res.render(app.get('views') + '/error', options);
			}
		});
	});
};