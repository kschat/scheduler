var mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

/**
* APIUser mongo schema
*
* @param {String} publicKey key used to look up private key of user
* @param {String} privateKey key used to authenticate API users
* @param {String} email used to determine if user has an account already
*/
var APIUserSchema = mongoose.Schema({
	publicKey: {
		type: String,
		require: true,
		index: {
			unique: true,
		},
	},
	privateKey: {
		type: String,
		require: true,
		index: {
			unique: true,
		},
	},
	email: {
		type: String,
		require: true,
		index: {
			unique: true,
		},
	},
},
{
	collection: 'APIUsers'
});

/**
* Middleware for saving a model
* Encrypts the public and private key using bcrypt
*/
APIUserSchema.pre('save', function(next) {
	var user = this;

	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.publicKey, salt, function(err, hash) {
			if(err) { return next(err); }

			user.publicKey = hash;
		});
	});
	
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.privateKey, salt, function(err, hash) {
			if(err) { return next(err); }

			user.privateKey = hash;
			next();
		});
	});
});

/**
* Model method used to compare two public keys
*
* @param {String} candidatePassword password to compare against
* @param {Function} callBack is passed err and isMatch used
*/
APIUserSchema.methods.comparePublicKey = function(candidatePassword, callBack) {
	bcrypt.compare(candidatePassword, this.publicKey, function(err, isMatch) {
        if (err) { return callBack(err) };
        
        callBack(null, isMatch);
    });
};

/**
* Model method used to compare two private keys
*
* @param {String} candidatePassword password to compare against
* @param {Function} callBack is passed err and isMatch used
*/
APIUserSchema.methods.comparePrivateKey = function(candidatePassword, callBack) {
	bcrypt.compare(candidatePassword, this.privateKey, function(err, isMatch) {
        if (err) { return callBack(err) };
        
        callBack(null, isMatch);
    });
};

/**
* Virtual method that creates an alias for _id as userID
*
* @return {String} ID of the user
*/
APIUserSchema.virtual('userID').get(function() {
	return this._id;
});


var APIUser = mongoose.model('APIUser', APIUserSchema);

module.exports = APIUser;