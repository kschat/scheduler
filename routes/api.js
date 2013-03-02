var fs = require('fs'),
	path = require('path');

function runOptions(model, sParams, query, callBack) {
	callBack = callBack || function(err, options) { 
		if(err) {
			throw err; 
		}

		console.log(options);
	},
	list = [];

	for(var param in sParams) {
		if(sParams[param].required && typeof query[param] === 'undefined') {
			callBack({ code: 404 , message: 'Missing required parameter: ' + param }, list);
		}
		if(query.hasOwnProperty(param) && typeof query[param] !== 'undefined') {
			var temp = {};
			temp[param] = query[param];
			list.push(temp);
		}
	}

	callBack(false, list);
}

function RESTGet(req, res) {
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
			return req.params[0] + ' does not exist.';
		}
		//A config file for the model doesn't exist.
		else if(ex.code === 'ENOENT') {
			modelSettings = {
				methods: [],
				params: {
					optional: []
				},
			};
		}
		else {
			res.send(500, 'Error: ' + ex);
			return;
		}
	}

	if(req.params[2] === true) {
		Model.find(req.params[2], function(err, users) {
			if(err) { 
				res.send(503, { error: 'Error contacting database:' });
				return 'Error contacting database:';
			}

			res.send(users);
		});
	}
	else {
		runOptions(Model, modelSettings.params, req.query, function(err, options) {
			if(err) {
				res.send(err); 
				return;
			}
			var query = Model.find();

			for(var i=0; i<options.length; i++) {
				var option = options[i];
				for(property in option) {
					if(!option.hasOwnProperty(property)) { continue; }

					if(property === 'limit') { query[property](option[property]); }
					else {
						query.where(property).equals(option[property]);
					}
				}
			}

			query.exec(function(err, results) {
				res.send(results);
			});
		});
	}

}

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
	app.get(/^\/api\/([a-zA-Z]+)(\/([0-9a-zA-Z]+))?\/?$/, RESTGet);

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

exports.get = RESTGet;