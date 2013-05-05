var mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

/**
* BetaKeys mongo schema
*
* @param {String} publicKey key used to look up private key of user
* @param {String} privateKey key used to authenticate API users
* @param {String} email used to determine if user has an account already
*/
var BetaKeySchema = mongoose.Schema({
	key: {
		type: String,
		require: true,
		index: {
			unique: true
		}
	},
	used: {
		type: Boolean,
		require: true,
		default: false
	}
},
{
	collection: 'BetaKeys'
});

/**
* Middleware for saving a model
* Encrypts the public and private key using bcrypt
*/
BetaKeySchema.pre('save', function(next) {
	var user = this;

	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.key, salt, function(err, hash) {
			if(err) { return next(err); }

			user.key = hash;
			next();
		});
	});
});

/**
* Model method used to compare two public keys
*
* @param {String} candidatePassword password to compare against
* @param {Function} callBack is passed err and isMatch used
*
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
*
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
*
APIUserSchema.virtual('userID').get(function() {
	return this._id;
});
*/

var BetaKey = mongoose.model('BetaKey', BetaKeySchema);

module.exports = BetaKey;