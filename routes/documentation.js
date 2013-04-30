var fs = require('fs'),
	path = require('path');

exports.init = function init(app) {
	//Default options to pass to the layout template
	var docDir = fs.readdirSync(app.get('docs')),
	options = {
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
		docs: []
	};

	docDir.forEach(function(file) {
		var filePath = path.resolve('./', app.get('docs'), file);
		options.docs.push({
			title: file.substring(0, file.indexOf('.')).replace(/_/g, ' '), 
			docs: JSON.parse(fs.readFileSync(filePath, 'utf-8'))
		});
	});

	//Index page route
	app.get(/^\/documentation\/?$/, function(req, res) {
		res.render(app.get('views') + '/documentation', options);
	});
};