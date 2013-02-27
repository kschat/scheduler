var assert = require("assert"),
	User = require('../models/user'),
	mongoose = require('mongoose');

describe('User', function() {
	mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		users = [];

	//Before each test rebuild the data in the database to query against.
	beforeEach(function(done) {
		users = [];
		users.push(new User({ name: 'test', email: 'test@test.com' }));
		users.push(new User({ name: 'kyle', email: 'kyle@test.com' }));
		users.push(new User({ name: 'matt', email: 'matt@test.com'}));

		done();
	});

	//After each test empty the users collection to get rid of "used" test data
	afterEach(function(done) {
		db.collections['users'].drop(function(err) {
			done();
		});
	});

	describe('name', function() {
		it('should return "test"', function() {
			assert.equal(users[0].name, 'test');
		});
	});

	//Tests saving user
	describe('#save()', function() {
		it('should not throw an error', function(done) {
			for(var i=0; i<users.length; i++) {
				users[i].save(function(err, user) {
					assert.ifError(err);
				});
			}

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

		it('should find the users based on their unique IDs', function(done) {
			User.find({userID: uid}, function(err, queriedUsers) {
				
			});

			done();
		});
	});
});