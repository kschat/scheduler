var mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

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

APIUserSchema.methods.comparePublicKey = function(candidatePassword, callBack) {
	bcrypt.compare(candidatePassword, this.publicKey, function(err, isMatch) {
        if (err) { return callBack(err) };
        
        callBack(null, isMatch);
    });
};

APIUserSchema.methods.comparePrivateKey = function(candidatePassword, callBack) {
	bcrypt.compare(candidatePassword, this.privateKey, function(err, isMatch) {
        if (err) { return callBack(err) };
        
        callBack(null, isMatch);
    });
};

APIUserSchema.virtual('userID').get(function() {
	return this._id;
});

APIUserSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
});

var APIUser = mongoose.model('APIUser', APIUserSchema);

module.exports = APIUser;