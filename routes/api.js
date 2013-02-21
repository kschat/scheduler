var mysql = require('mysql');

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
	app.get(/^\/api\/([a-zA-Z]+)(\/([0-9]+))?\/?$/, function(req, res) {
		res.send(req.params);
		/*var connection = mysql.createConnection({
			database: 	'scheduler',
			host: 		'localhost',
			user: 		'scheduler',
			password: 	'121689kyle', 
		});

		connection.connect();
		connection.query('SELECT * FROM testTable', function(err, rows, fields) {
			if(err) throw err;

			console.log(rows);
		});

		res.send({"test": req.params});*/
	});

	/*
	* Generic DELETE REST implementation.
	* Matches:
	* /api/<controller>/<id> where both controller and id are required
	* 
	*/
	app.delete(/^\/api\/([a-zA-Z]+)\/([0-9]+)\/?/, function(req, res) {
		res.send(req.params);
	});
}