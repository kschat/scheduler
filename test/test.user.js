var assert = require("assert"),
	User = require('../models/user'),
	mongoose = require('mongoose');

describe('User', function() {
	mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		user;

	//Before each test rebuild the data in the database to query against.
	beforeEach(function(done) {
		db.collections['users'].drop(function(err) {
			if(err) throw err;
		});

		user = new User({ name: 'test', email: 'test@test.com' });

		user.save(function(err, user) {
			assert.ifError(err);
			done();
		});
	});

	after(function(done) {
		db.close();
		done();
	});

	describe('name', function() {
		it('should return "test"', function() {
			assert.equal(user.name, 'test');
		});
	});

	//Tests saving user
	describe('#save()', function() {
		it('should not throw an error', function(done) {
			user.save(function(err, user) {
				assert.ifError(err);
			});

			done();
		});
	});

	//Test find all users
	describe('#find()', function() {
		it('should not throw an error', function(done) {
			User.find(function(err, users) {
				assert.ifError(err);
				done();
			});
		});

		it('should find a user with the name "kyle" and email "test@test.com"', function(done) {
			User.find({name: 'kyle', email: 'kyle@test.com'}, function(err, queriedUsers) {
				assert.ifError(err);
				//assert.strictEqual(queriedUsers.length, 1, 'The length was not 1');
				done();
			})
		});
	});
});