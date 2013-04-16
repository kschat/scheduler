

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
			title: 'Scheduler',
			isPage: true,
			loggedIn: false,
			searchOn: false,
			userName: 'dev', //remove for production
			links: {
				styles: [
					'/css/bootstrap.css',
					'/css/bootstrap-responsive.css',
					'/css/mainStyle.css',
					'/css/font-awesome.min.css',
				],
			},
		};

	app.get(/^\/courses\/?$/, function(req, res) {
		//if(!req.session.loggedIn) {
		//	res.redirect('login');
		//	return;
		//}
		options.searchOn = true;
		options.loggedIn = req.session.loggedIn;
		//options.userName = req.session.user.userName;
		res.render(app.get('views') + '/course/courses', options);
	});

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
};