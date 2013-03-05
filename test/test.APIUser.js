var should = require('should'),
	APIUser = require('../models/APIUser'),
	mongoose = require('mongoose'),
	crypto = require('crypto');

describe('APIUser', function() {
	mongoose.connect('mongodb://localhost/scheduler');
	var db = mongoose.connection,
		user, pubKey, prvKey;

	//Before each test rebuild the data in the database to query against.
	beforeEach(function(done) {
		db.collections['APIUsers'].drop(function(err) {
			if(err) throw err;
		});
		crypto.randomBytes(48, function(ex, buf) {
			pubKey = buf.toString('hex');
			crypto.randomBytes(48, function(ex, buf) {
				prvKey = buf.toString('hex');

				user = new APIUser({ 
					publicKey: pubKey,
					privateKey: prvKey,
					email: 'test@test.com',
				});

				user.save(function(err, user) {
					should.not.exist(err);
					done();
				});
			});
		});
	});

	after(function(done) {
		db.close();
		done();
	});

	describe('#comparePublicKey(canidatePassword, callBack)', function() {
		it('should evaluate to a match', function(done) { 
			user.comparePublicKey(pubKey, function(err, isMatch) {
				if(err) { throw err; }

				isMatch.should.equal(true);
				done();
			});
		});

		it('should not evaluate to a match', function(done) {
			user.comparePublicKey('wrongpassword', function(err, isMatch) {
				if(err) { throw err; }

				isMatch.should.equal(false);
				done();
			});
		});
	});

	describe('#comparePrivateKey(canidatePassword, callBack)', function() {
		it('should evaluate to a match', function(done) { 
			user.comparePrivateKey(prvKey, function(err, isMatch) {
				if(err) { throw err; }

				isMatch.should.equal(true);
				done();
			});
		});

		it('should not evaluate to a match', function(done) {
			user.comparePrivateKey('wrongpassword', function(err, isMatch) {
				if(err) { throw err; }

				isMatch.should.equal(false);
				done();
			});
		});
	});

	describe('validating message sent with public key', function() {
		it('should return true when comparing client hash and server hash', function(done) {
			var queryString = '?test=testing&userID=' + user.publicKey,
				clientHash = crypto.createHmac('sha1', user.privateKey).update(queryString).digest('hex');

			APIUser.findOne({ publicKey: user.publicKey }, 'privateKey', function(err, pKey) {
				if(err) throw err;

				var serverHash = crypto.createHmac('sha1', pKey.privateKey).update(queryString).digest('hex');
				console.log(user.publicKey);
				console.log(serverHash);
				serverHash.should.equal(clientHash);
				done();
			});
		});

	});
});