var fs = require('fs'),
	path = require('path');

function checkAllowed(request, allowed) {
	for(var i=0; i<allowed.length; i++) {
		if(request === allowed[i]) { return true; }
	}

	return false;
}

function runOptions(model, sParams, query, callBack) {
	var callBack = callBack || function(err, options) { 
		if(err) {
			throw err; 
		}
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

function filterOptions(options, model) {
	var query = model.find() || {};

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

	return query;
}

function loadModel(model) {
	var Model = {},
		modelSettings = {};
	//Get the model and it's settings based on the first API parameter
	//Handle any errors that may occur
	try {
		Model = require('../models/' + model);
		modelSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/'+ model + '.json')));
	}
	catch(ex) {
		//The client requested a model that doesn't exist.
		if(ex.code === 'MODULE_NOT_FOUND') {
			return { error: true, code: 404, message: model + ' does not exist.' };
		}
		//A config file for the model doesn't exist, load the default one.
		else if(ex.code === 'ENOENT') {
			modelSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/default.json')));
		}
		else {
			return { error: true, code: 500, message: 'Error: ' + ex };
		}
	}

	return { error: false, model: Model, modelSettings: modelSettings };
}

function RESTGet(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error === true) {
		res.send(Model.code, Model.message);
		return;
	}

	var modelSettings = Model.modelSettings;
	Model = Model.model;

	if(!checkAllowed('GET', modelSettings.methods)) {
		res.send(405, 'Allow: ' + modelSettings.methods);
		return;
	}

	if(typeof req.params[2] != 'undefined') {
		Model.find({ _id: req.params[2] }, function(err, users) {
			if(err) { 
				res.send(503, { error: 'Error contacting database:' });
				return 'Error contacting database:';
			}

			res.send(users);
			return;
		});
	}
	else {
		runOptions(Model, modelSettings.params, req.query, function(err, options) {
			var query = filterOptions(options, Model);
			if(err) {
				res.send(err.code, err.message);
			}
			else {
				query.exec(function(err, results) {
					res.send(results);
				});
			}
		});
	}
}

function RESTPost(req, res) {

}

exports.init = function init(app) {

	/*
	* Generic POST REST implementation.
	* Matches: 
	* /api/<controller> where the controller is required
	*/
	app.post(/^\/api\/([a-zA-Z]+)\/?$/, RESTPost);

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