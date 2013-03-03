var fs = require('fs'),
	path = require('path'),
	_ = require('underscore');

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
			return;
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
			if(model === 'server') {
				modelSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/default.json')));
				return { error: false, modelSettings: getOptions(model).settings };
			}
			else {
				return { error: true, code: 404, message: model + ' does not exist.' };
			}
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

function getOptions(model) {
	var settings = {};
	//Get the model and it's settings based on the first API parameter
	//Handle any errors that may occur
	try {
		settings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/'+ model + '.json')));
	}
	catch(ex) {
		//A config file for the model doesn't exist, load the default one.
		if(ex.code === 'ENOENT') {
			settings = JSON.parse(fs.readFileSync(path.join(__dirname, '../models/config/default.json')));
		}
		else {
			return { error: true, code: 500, message: 'Error: ' + ex };
		}
	}

	return { error: false, settings: settings };
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
		res.set('Allow', modelSettings.methods);
		res.send(405, 'Allow: ' + modelSettings.methods);
		return;
	}

	if(typeof req.params[2] != 'undefined') {
		Model.find({ _id: req.params[2] }, function(err, models) {
			if(err) { 
				res.send(503, { error: 'Error contacting database:' });
				return;
			}

			res.send(models);
			return;
		});
	}
	else {
		runOptions(Model, modelSettings.params.GET, req.query, function(err, options) {
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

function RESTPut(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error === true) {
		res.send(Model.code, Model.message);
		return;
	}

	var modelSettings = Model.modelSettings;
	Model = Model.model;

	if(!checkAllowed('PUT', modelSettings.methods)) {
		res.set('Allow', modelSettings.methods);
		res.send(405, 'Allow: ' + modelSettings.methods);
		return;
	}

	runOptions(Model, modelSettings.params.PUT, req.body, function(err, options) {
		var optObj = {};

		for(var i=0; i<options.length; i++) {
			for(var key in options[i]) {
				if(!options[i].hasOwnProperty(key)) { continue; }
				optObj[key] = options[i][key];
			}
		}

		var newModel = new Model(optObj);

		if(err) {
			res.send(err.code, err.message);
			return;
		}
		else {
			if(typeof req.params[2] !== 'undefined') {
				Model.find({ _id: req.params[2] }, function(err, model) {
					if(err) { 
						res.send(503, { error: 'Error contacting database:' });
						return;
					}
					if(!_.isEmpty(model)) { 
						//Needs to be changed to save to allow for pre hooks to fire.
						Model.update({ _id: req.params[2] }, { $set: optObj }, function(err, numberAffected, rawResponse) {
							if(err) { res.send(err); return; }

							res.send(200, rawResponse);
							return;
						});
					}
				});
			}
			else {
				newModel = new Model(optObj);
				newModel.save(function(err, model) {
					if(err) {
						res.send(500, 'Error creating entity: ' + err);
						return;
					}
					else {
						res.send(201, model);
					}
				});
			}
		}
	});
}

function RESTPost(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error === true) {
		res.send(Model.code, Model.message);
		return;
	}

	var modelSettings = Model.modelSettings;
	Model = Model.model;

	if(!checkAllowed('POST', modelSettings.methods)) {
		res.set('Allow', modelSettings.methods);
		res.send(405, 'Allow: ' + modelSettings.methods);
		return;
	}
}

function RESTDelete(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error === true) {
		res.send(Model.code, Model.message);
		return;
	}

	var modelSettings = Model.modelSettings;
	Model = Model.model;

	if(!checkAllowed('DELETE', modelSettings.methods)) {
		res.set('Allow', modelSettings.methods);
		res.send(405, 'Allow: ' + modelSettings.methods);
		return;
	}
}

function RESTOptions(req, res) {
	var options = loadModel(req.params[0] || 'server');

	if(options.error === true) {
		res.send(options.code, options.message);
		return;
	}

	options = options.modelSettings;
	res.set('Allow', options.methods);

	if(!checkAllowed('OPTIONS', options.methods)) {
		res.send(405, 'Allow: ' + options.methods);
		return;
	}

	res.send(200, options.params);
	return;
}

function RESTPatch(req, res) {

}

exports.init = function init(app) {

	/*
	* Generic POST REST implementation.
	* Matches: 
	* /api/<controller>/<id> where the controller is required but the id is optional
	*/
	app.post(/^\/api\/([a-zA-Z]+)(\/([0-9a-zA-Z]+))?\/?$/, RESTPost);

	/*
	* Generic PUT REST implementation.
	* Matches:
	* /api/<controller>/<id> where both controller and id are required
	*/
	//Need to test regex
	app.put(/^\/api\/([a-zA-Z]+)(\/([0-9a-zA-Z]+))\/?$/, RESTPut);

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
	//Need to test regex
	app.delete(/^\/api\/([a-zA-Z]+)\/([0-9a-zA-Z]+)\/?/, RESTDelete);

	//Need to test regex
	app.patch(/^\/api\/([a-zA-Z]+)\/([0-9a-zA-Z]+)\/?/, RESTPatch);

	app.options(/^\/api\/([a-zA-Z]+)?\/?/, RESTOptions);

	app.all(/^\/api(\/+)?$/, function(req, res) {
		res.send(404);
	});
}