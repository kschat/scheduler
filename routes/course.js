

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
			title: 'Scheduler',
			isPage: true,
			loggedIn: false,
			searchOn: false,
			links: {
				styles: [
					'/css/bootstrap.css',
					'/css/bootstrap-responsive.css',
					'/css/mainStyle.css',
				],
			},
		};

	app.get(/^\/courses\/?$/, function(req, res) {
		//if(!req.session.loggedIn) {
		//	res.redirect('back');
		//}
		options.loggedIn = req.session.loggedIn;
		res.render(app.get('views') + '/course/courses', options);
	});

	app.get(/^\/courses\/search?$/, function(req, res) {
		//if(!req.session.loggedIn) {
		//	res.redirect('back');
		//}
		options.loggedIn = req.session.loggedIn;
		res.render(app.get('views') + '/course/advanced-search', options);
	});
};