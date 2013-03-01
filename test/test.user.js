var assert = require("assert"),
	User = require('../models/user'),
	mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

describe('User', function() {
	//mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		user;

	//Before each test rebuild the data in the database to query against.
	beforeEach(function(done) {
		db.collections['user'].drop(function(err) {
			if(err) throw err;
		});

		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash('testPassword', salt, function(err, hash) {
				user = new User({ 
					firstName: 'test first name',
					lastName: 'test last name',
					email: 'test@test.com',
					password: hash,
				});

				user.save(function(err, user) {
					assert.ifError(err);
					done();
				});
			});
		});
	});

	after(function(done) {
		db.close();
		done();
	});

	describe('firstName', function() {
		it('should return "test first name"', function() {
			assert.equal(user.firstName, 'test first name');
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

		it('should find a user with the first name "test first name" and email "test@test.com"', function(done) {
			User.find({firstName: 'test first name', email: 'test@test.com'}, function(err, queriedUsers) {
				assert.ifError(err);
				//assert.strictEqual(queriedUsers.length, 1, 'The length was not 1');
				done();
			})
		});
	});
});