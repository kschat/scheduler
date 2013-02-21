

exports.init = function init(app) {
	app.post(/^\/user\/?$/, function(req, res) {
		res.send({"user" : "worked"});
	});
}