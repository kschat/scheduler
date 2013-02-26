var assert = require("assert");
var User = require('../models/users').User;

describe('User', function() {
	var user = new User({ name: 'test' });
	describe('name', function() {
		it('should return \'test\'', function() {
			assert.equal(user.name, 'test');
		});
	});

	describe('#save()', function() {
		it('should not throw an error', function() {
			user.save(function(err, user) {
				assert.ifError(err);
			});
		});
	});

	describe('#find()', function() {
		it('should not throw an error', function() {
			User.find(function(err, users) {
				assert.ifError(err);
				console.log(users);
			});
		});
	});
});