var fs = require('fs'),
	path = require('path');

exports.init = function init(app) {

	/*
	* Generic POST REST implementation.
	* Matches: 
	* /api/<controller> where the controller is required
	*/
	app.post(/^\/api\/([a-zA-Z]+)\/?$/, function(req, res) {
		res.send(req.body.test);
	});

	/*
	* Generic PUT REST implementation.
	* Matches:
	* /api/<controller>/<id> where both controller and id are required
	*/
	app.put(/^\/api\/([a-zA-Z]+)\/([0-9]+)\/?$/, function(req, res) {
		res.send(req.body.test);
	});

	/*
	* Generic GET REST implementation. 
	* Matches: 
	* /api/<controller>/<id> where the controller is required but the id is optional
	* Returns:
	* If no id was given, a full list of the controller is returned.
	* Otherwise returns that specific model instance
	*/
	app.get(/^\/api\/([a-zA-Z]+)(\/([0-9a-zA-Z]+))?\/?$/, function(req, res) {
		var Model = {},
			modelSettings = {};

		try {
			Model = require('../models/' + req.params[0]);
			modelSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/'+ req.params[0] + '.json')));
		}
		catch(ex) {
			//The client requested a model that doesn't exist.
			if(ex.code === 'MODULE_NOT_FOUND') {
				res.send(404, req.params[0] + ' does not exist.');
				return;
			}
			//A config file for the model doesn't exist.
			if(ex.code === 'ENOENT') {
				modelSettings = {};
			}
		}

		var filter = req.params[2]? { _id: req.params[2] }: {};

		Model.find(filter, function(err, users) {
			if(err) { 
				res.send(503, { error: 'Error contacting database:' });
				return;
			}

			res.send(users);
		});

	});

	/*
	* Generic DELETE REST implementation.
	* Matches:
	* /api/<controller>/<id> where both controller and id are required
	* 
	*/
	app.delete(/^\/api\/([a-zA-Z]+)\/([0-9a-zA-Z]+)\/?/, function(req, res) {
		res.send(req.params);
	});
}