var fs = require('fs'),
	path = require('path'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	crypto = require('crypto');

mongoose.connect('mongodb://localhost/scheduler');
var db = mongoose.connection;

function checkAllowed(request, allowed) {
	for(var i=0; i<allowed.length; i++) {
		if(request === allowed[i]) { return true; }
	}

	return false;
}

function arrayToObject(arr) {
	var obj = {};
	for(var i=0; i<arr.length; i++) {
		for(var key in arr[i]) {
			if(!arr[i].hasOwnProperty(key)) { continue; }
			obj[key] = arr[i][key];
		}
	}

	return obj;
}

function updateModel(model, newModel) {
	for(var key in newModel) {
		if(!newModel.hasOwnProperty(key)) { continue; }
		model[key] = newModel[key];
	}

	return model;
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

			if(property === 'limit' || property === 'skip') { 
				query[property](option[property]); 
			}
			else if(property === 'count') {
				query.count();
			}
			else {
				var re = new RegExp(option[property], 'i');
				query.where(property).regex(re);
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

function authenticateRequest(APIKey, clientHash, req, callBack) {
	var APIUser = require('../models/APIUser'),
	callBack = callBack || function(err, pKey) {
		if(err) throw err;

		var serverHash = crypto.createHmac('sha1', pKey.privateKey).update(req).digest('hex');
		
	};

	APIUser.findOne({ publicKey: APIKey }, 'privateKey', callBack);
}

function RESTAuth(req, res, next) {
	var credetials = req.get('Authorization').split(' ')[1];
	credetials = new Buffer(credetials, 'base64').toString();

	var APIKey = credetials.split(':')[0],
		cHash = credetials.split(':')[1],
		requestData = JSON.stringify(req.body) + JSON.stringify(req.query);

	authenticateRequest(APIKey, cHash, requestData, function(err, pKey) {
		if(err) throw err;

		if(!_.isEmpty(pKey)) {
			var serverHash = crypto.createHmac('sha1', pKey.privateKey).update(requestData).digest('hex');
			if(cHash === serverHash) {
				next();
				return;
			}
		}
		
		res.send(403);
		return;
	});
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

	if(typeof req.params[1] != 'undefined') {
		Model.find({ _id: req.params[1] }, function(err, models) {
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
					if(typeof results === 'number') {
						res.send({count: results});
					}
					else {
						res.send(results);
					}
				});
			}
		});
	}
}

function RESTPut(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error) {
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
		if(err) {
			res.send(err.code, err.message);
			return;
		}

		var optObj = arrayToObject(options),
			newModel = new Model(optObj);

		Model.findOne({ _id: req.params[1] }, function(err, model) {
			if(err) { 
				res.send(503, { error: 'Error contacting database: ' + err });
				return;
			}

			if(!_.isEmpty(model)) {
				model = updateModel(model, optObj);

				model.save(function(err, model) {
					if(err) { res.send(500, err); return; }

					res.send(200, model);
					return;
				});
			}
			else {
				newModel = new Model(optObj);
				newModel._id = req.params[1];

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
		});
	});
}

function RESTPost(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error) {
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

	if(typeof req.params[1] === 'undefined') {
		runOptions(Model, modelSettings.params.POST.create, req.body, function(err, options) {
			if(err) {
				res.send(err.code, err.message);
				return;
			}
			var optObj = arrayToObject(options),
				newModel = new Model(optObj);

			newModel.save(function(err, model) {
				if(err) {
					res.send(500, 'Error creating entity: ' + err);
					return;
				}
				
				res.send(201, model);
			});
		});
	}
	else {
		Model.findOne({ _id: req.params[1] }, function(err, model) {
			if(err) { 
				res.send(503, { error: 'Database error: ' + err });
				return;
			}

			if(_.isEmpty(model)) {
				res.send(404, 'The specificed resource was not found.');
				return;
			}
			runOptions(Model, modelSettings.params.POST.update, req.body, function(err, options) {
				if(err) {
					res.send(err.code, err.message);
					return;
				}
				var optObj = arrayToObject(options);
				model = updateModel(model, optObj);

				model.save(function(err, model) {
					if(err) {
						res.send(500, 'Error creating entity: ' + err);
						return;
					}
					
					res.send(200, model);
				});
			});
		});
	}
}

function RESTDelete(req, res) {
	var Model = loadModel(req.params[0]);

	if(Model.error) {
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

	Model.findOne({ _id: req.params[1] }, function(err, model) {
		if(err) {
			res.send(503, { error: 'Error contacting database:' });
			return;
		}

		if(_.isEmpty(model)) {
			res.send(404, req.params[0] + ' ' + req.params[1] + ' not found');
		}
		else {
			model.remove(function(err, model) {
				if(err) {
					res.send(500, { error: err });
					return;
				}

				res.send(200, model);
				return;
			});
		}
	});
}

function RESTOptions(req, res) {
	var options = loadModel(req.params[0] || 'server');

	if(options.error) {
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

function RESTCatchAll(req, res) {
	res.send(404);
}

exports.init = function init(app) {

	/*
	* Generic POST REST implementation.
	* Matches: 
	* /api/<controller>/<id> where the controller is required but the id is optional
	*/
	app.post(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))?\/?$/, RESTPost);

	/*
	* Generic PUT REST implementation.
	* Matches:
	* /api/<controller>/<id> where both controller and id are required
	*/
	app.put(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))\/?$/, RESTPut);

	/*
	* Generic GET REST implementation. 
	* Matches: 
	* /api/<controller>/<id> where the controller is required but the id is optional
	* Returns:
	* If no id was given, a full list of the controller is returned.
	* Otherwise returns that specific model instance
	*/
	app.get(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))?\/?$/, RESTGet);

	/*
	* Generic DELETE REST implementation.
	* Matches:
	* /api/<controller>/<id> where both controller and id are required
	* 
	*/
	app.delete(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))\/?$/, RESTDelete);

	app.options(/^\/api\/([a-zA-Z]+)?\/?/, RESTOptions);

	app.all(/^\/api\/?(.+)?$/, RESTCatchAll);
}