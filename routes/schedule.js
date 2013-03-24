
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
					'/css/font-awesome.min.css',
				],
			},
		};

	app.get(/^\/schedule\/create\/?$/, function(req, res) {
		options.searchOn = false;
		options.loggedIn = req.session.loggedIn;
		options.userName = 'kschat';
		res.render(app.get('views') + '/schedule/create', options);
	});
};