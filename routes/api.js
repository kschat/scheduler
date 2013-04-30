/**
* Required modules
*/

var fs = require('fs'),
	path = require('path'),
	mongoose = require('mongoose'),
	_ = require('underscore'),
	crypto = require('crypto');

mongoose.connect('mongodb://localhost/scheduler');
var db = mongoose.connection;

/**
* Determines if the request method is allowed for a particular entity
*
* @param {String} request method type
* @param {Array} allowed array of acceptable methods
* @return {Boolean} true if allowed; false otherwise
*/
function checkAllowed(request, allowed) {
	for(var i=0; i<allowed.length; i++) {
		if(request === allowed[i]) { return true; }
	}

	return false;
}

/**
* Converts an array to an object literal
*
* @param {Array} arr the array to be converted
* @return {Object} obj converted object literal
*/
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

/**
* Updates a model by merging in the properties of a new model.
* If non-unique properties will be over written in the old model
* by the value of the new model.
*
* @param {Object} model model to be updated
* @param {Object} newModel model used to update the old model
* @return {Object} model updated model
*/
function updateModel(model, newModel) {
	for(var key in newModel) {
		if(!newModel.hasOwnProperty(key)) { continue; }
		model[key] = newModel[key];
	}

	return model;
}

/**
* Determines if all required properties are present and creates
* an array containing the parameters and their values sent to the
* server.
*
* @param {Object} model the model to be checked against
* @param {Object} sParams the setting parameters of the current model
* @param {Object} query The query string sent to the server
* @param {Function} callBack optional callback function
*/
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

/**
* Generates a query object based on the options passed into
* the function on the model specified.
*
* @param {Object} options object containing the queries to run on the model
* @param {Object} model the model to query
* @return {Object} object literal containing the query object and the count
*/
function filterOptions(options, model) {
	var query = model.find() || {},
		count = false,
		cachedFilters = {};

	for(var i=0; i<options.length; i++) {
		var option = options[i];
		for(property in option) {
			if(!option.hasOwnProperty(property)) { continue; }

			if(property === 'limit' || property === 'skip') { 
				query[property](option[property]); 
			}
			else if(property === 'count') { 
				count = true;
			}
			else {
				var re = new RegExp(option[property], 'i');
				query.where(property).regex(re);
				cachedFilters[property] = re;	//Caches all filters used on the query incase we need to count the result set.
			}
		}
	}

	//If count was set to true then we need to reconstruct the query and count its result set.
	//Not the best way to do it, but it works until refactoring time.
	if(count) {
		count = model.find();
		for(filter in cachedFilters) {
			if(!option.hasOwnProperty(property)) { continue; }
			
			count.where(filter).regex(cachedFilters[filter]);
		}
		count.count();
	}

	return { query: query, count: count };
}

/**
* Loads a model and it's settings from the 'models' and 'models/config' directories.
*
* @param {String} model name of the model to load
* @return {Object} If there's an error returns object literal containing code and message; otherwise the model and it's settings
*/
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

/**
* Gets the settings for the model specified
*
* @param {String} model name of the model
* @return {Object} object literal containing any error information and an object containing the settings
*/
function getOptions(model) {
	var settings = {};
	//Get the model and its settings based on the first API parameter
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

/**
* Determines if a request is authorized using a public/private key pair
*
* @param {String} APIKey public key used to look up private key
* @param {String} clientHash SHA1 hash of the request sent by the client
* @param {Object} request sent by the client
* @param {Function} callBack function to be called when the private key is found
*/
function authenticateRequest(APIKey, clientHash, req, callBack) {
	var APIUser = require('../models/APIUser'),
	callBack = callBack || function(err, pKey) {
		if(err) throw err;

		var serverHash = crypto.createHmac('sha1', pKey.privateKey).update(req).digest('hex');
		
	};

	APIUser.findOne({ publicKey: APIKey }, 'privateKey', callBack);
}

/**
* RESTful authentication of request from client
*
* @param {Object} req request from client
* @param {Object} res object used to send response
* @param {Function} next callback used to call the next route middleware
*/
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

/**
* REST GET middleware function
*
* @param {Object} req request from client
* @param {Object} res object used to send response
*/
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
			var queries = filterOptions(options, Model),
				count = queries.count,
				results = {};

			if(err) {
				res.send(err.code, err.message);
			}
			else {
				queries.query.exec(function(err, result) {
					if(count) {
						count.exec(function(err, count) {
							results.count = count;
							results[req.params[0]] = result;
							res.send(results);
						});
					}
					else {
						_.uniqObjects = function( arr ){
							return _.uniq( _.collect( arr, function( x ){
								return JSON.stringify( x );
							}));
						};

						res.send(result);
					}
				});
			}
		});
	}
}

/**
* REST PUT middleware function
*
* @param {Object} req request from client
* @param {Object} res object used to send response
*/
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

/**
* REST POST middleware function
*
* @param {Object} req request from client
* @param {Object} res object used to send response
*/
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

/**
* REST DELETE middleware function
*
* @param {Object} req request from client
* @param {Object} res object used to send response
*/
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

/**
* REST OPTIONS middleware function
*
* @param {Object} req request from client
* @param {Object} res object used to send response
*/
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

/**
* Function used to catch any calls to /api/.* that don't match any other routes
*
* @param {Object} req request from client
* @param {Object} res object used to send response
*/
function RESTCatchAll(req, res) {
	res.send(404);
}

exports.init = function init(app) {

	/*
	* Generic POST REST implementation.
	* Matches: 
	* /api/<model>/<id> where the model is required but the id is optional
	*/
	app.post(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))?\/?$/, RESTPost);

	/*
	* Generic PUT REST implementation.
	* Matches:
	* /api/<model>/<id> where both model and id are required
	*/
	app.put(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))\/?$/, RESTPut);

	/*
	* Generic GET REST implementation. 
	* Matches: 
	* /api/<model>/<id> where the model is required but the id is optional
	* 
	* @return {Array} If no id was given, a full list of the model is returned.
	* Otherwise returns that specific model instance
	*/
	app.get(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))?\/?$/, RESTGet);

	/*
	* Generic DELETE REST implementation.
	* Matches:
	* /api/<model>/<id> where both model and id are required
	* 
	*/
	app.delete(/^\/api\/([a-zA-Z]+)(?:\/([0-9a-zA-Z]+))\/?$/, RESTDelete);

	app.options(/^\/api\/([a-zA-Z]+)?\/?/, RESTOptions);

	app.all(/^\/api\/?(.+)?$/, RESTCatchAll);
}