var mysql = require('mysql');

exports.init = function init(app) {
	app.get(/\/:id\/([0-9])/, function(req, res) {
		var connection = mysql.createConnection({
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

		res.send({"test": req.params});
	});
}