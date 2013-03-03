var should = require('should'),
	User = require('../models/user'),
	mongoose = require('mongoose');

describe('User', function() {
	mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		user;

	//Before each test rebuild the data in the database to query against.
	beforeEach(function(done) {
		db.collections['user'].drop(function(err) {
			if(err) throw err;
		});

		user = new User({ 
			firstName: 'test first name',
			lastName: 'test last name',
			email: 'test@test.com',
			password: 'testpassword',
		});

		user.save(function(err, user) {
			should.not.exist(err);
			done();
		});
	});

	after(function(done) {
		db.close();
		done();
	});

	describe('firstName', function() {
		it('should return "test first name"', function() {
			user.firstName.should.equal('test first name');
		});
	});

	//Test find all users
	describe('#find()', function() {
		it('should not throw an error', function(done) {
			User.find(function(err, users) {
				should.not.exist(err);
				done();
			});
		});

		it('should find a user with the first name "test first name" and email "test@test.com"', function(done) {
			User.find({firstName: 'test first name', email: 'test@test.com'}, function(err, queriedUsers) {
				should.not.exist(err);
				queriedUsers.should.not.be.empty;
				queriedUsers.should.have.length(1);
				done();
			})
		});
	});

	describe('#comparePassword(canidatePassword, callBack)', function() {
		it('should evaluate to a match', function(done) { 
			user.comparePassword('testpassword', function(err, isMatch) {
				if(err) { throw err; }

				isMatch.should.equal(true);
				done();
			});
		});

		it('should not evaluate to a match', function(done) {
			user.comparePassword('wrongpassword', function(err, isMatch) {
				if(err) { throw err; }

				isMatch.should.equal(false);
				done();
			});
		});
	});
});