/*var assert = require('assert'),
	should = require('should'),
	User = require('../models/user'),
	mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

describe('Routes', function() {
	//mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		user;

	//Before each test rebuild the data in the database to query against.
	before(function(done) {
		db.collections['user'].drop(function(err) {
			if(err) throw err;
		});

		var i = 0;

		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash('testPassword', salt, function(err, hash) {
				user = new User({ 
					firstName: 'test first name' + i,
					lastName: 'test last name' + i,
					email: 'test@test.com' + i++,
					password: hash,
				});

				user.save(function(err, user) {
					assert.ifError(err);
				});
			});
		});

		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash('testPassword', salt, function(err, hash) {
				user = new User({ 
					firstName: 'test first name' + i,
					lastName: 'test last name' + i,
					email: 'test@test.com' + i++,
					password: hash,
				});

				user.save(function(err, user) {
					assert.ifError(err);
				});
			});
		});

		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash('testPassword', salt, function(err, hash) {
				user = new User({ 
					firstName: 'test first name' + i,
					lastName: 'test last name' + i,
					email: 'test@test.com' + i++,
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

	describe('test', function() {
		it('should return true', function() {
			should.equal(true, true);
		});
	});
});*/