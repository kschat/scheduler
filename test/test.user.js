var assert = require("assert"),
	User = require('../models/users').User,
	mongoose = require('mongoose');

describe('User', function() {
	mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		user1 = new User({ name: 'test' }),
		user2 = new User({ name: 'kyle' }),
		user3 = new User({ name: 'matt' });

	beforeEach(function(done) {
		user1 = new User({ name: 'test' });
		user2 = new User({ name: 'kyle' });
		user3 = new User({ name: 'matt' });
		done();
	});

	describe('name', function() {
		it('should return "test"', function() {
			assert.equal(user1.name, 'test');
		});
	});

	//Tests saving user
	describe('#save()', function() {
		it('should not throw an error', function(done) {
			user1.save(function(err, user) {
				assert.ifError(err);
				done();
			});
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
			User.find({ name: 'kyle', email: 'test@test.com'}, function(err, users) {
				assert.ifError(err);
				console.log(users);
				done();
			})
		});
	});

	afterEach(function(done) {
		db.collections['users'].drop(function(err) {
			done();
		});
	});
});