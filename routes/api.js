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
			modelSettings = {},
			parameters = {},
			payload = {};

		//Get the model and it's settings based on the first API parameter
		//Handle any errors that may occur
		try {
			Model = require('../models/' + req.params[0]);
			modelSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/'+ req.params[0] + '.json')));
		}
		catch(ex) {
			console.log(ex);
			//The client requested a model that doesn't exist.
			if(ex.code === 'MODULE_NOT_FOUND') {
				res.send(404, req.params[0] + ' does not exist.');
				return;
			}
			//A config file for the model doesn't exist.
			if(ex.code === 'ENOENT') {
				modelSettings = {
					methods: [],
					params: {
						optional: []
					},
				};
			}
		}

		var sParams = modelSettings.params;
		for(var param in sParams) {
			if(sParams[param].required && typeof req.query[param] === 'undefined') {
				res.send(404, 'Missing required parameter: ' + param);
				return;
			}
			if(req.query.hasOwnProperty(param) && typeof req.query[param] !== 'undefined') {
				try {
					console.log(Model[param](Model, req.query[param]));
				}
				catch(ex) {
					res.send(500, ex);
					return;
				}
			}
		}

		var filter = req.params[2]? { _id: req.params[2] }: {};

		Model.find(filter, function(err, users) {
			if(err) { 
				res.send(503, { error: 'Error contacting database:' });
				return;
			}

			res.send(req.query);
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