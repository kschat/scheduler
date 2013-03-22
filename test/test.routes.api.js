var should = require('should'),
	RESTRoutes = require('../routes/api');

var request = {
	params: [
		'user'
	],
	query: {},
},
	response = {};

describe('REST API routes', function() {
	it('should return a list of users', function(done) {
		RESTRoutes.get(request, response);
		console.log(response);
		done();
	});

	after(function(done) {
		db.close();
		done();
	});
});