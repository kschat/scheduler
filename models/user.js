var mongoose = require('mongoose'),
	bcrypt = require('bcrypt');

function validateName(val) {
	return val.length >= 2 && val.length <= 35;
}

function validateEmail(val) {
	return /^.+@.+\..+$/.test(val);
}

function validatePassword(val) {
	return val.length > 3;
}

function validatePasswordStrong(val) {
	var hasSpecialCharacter = /[^a-z ]/.test(val);

	return validatePassword(val) && (
			(val.length > 12 && hasSpecialCharacter) || 
			(val.length > 20)
		);
}

function validatePasswordMedium(val) {
	var hasSpecialCharacter = /[^a-z ]/.test(val);

	return  validatePassword(val) && (
				(val.length > 10 && val.length < 21) || 
				(val.length > 7 && val.length < 13 && hasSpecialCharacter)
			);
}

function validatePasswordWeak(val) {
	return validatePassword(val) && val.length < 8;
}

var userSchema = mongoose.Schema({
	firstName: { 
		type: String, 
		required: true,
		validate: [
			validateName, 'Error with first name',
		],
	},
	lastName: {
		type: String, 
		required: true,
		validate: [
			validateName, 'Error with last name',
		],
	},
	userName: {
		type: String, 
		required: true,
		index: {
			unique: true,
		},
	},
	description: {
		type: String,
		required: false,
		default: 'No description',
	},
	email: {
		type: String, 
		required: true, 
		index: {
			unique: true,
		},
		validate: [
			validateEmail, 'Error with email address',
		],
	},
	password: {
		type: String, 
		required: true,
		validate: [
			{ validator: validatePassword, msg: 'Password too short' },
		],
	},
	avatar: {
		type: String,
		default: '/img/defaultProfile.jpg'
	}
},
{
	collection: 'user'
});

userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) { return next(); }

	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) { return next(err); }

			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function(candidatePassword, callBack) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) { return callBack(err) };
        
        callBack(null, isMatch);
    });
};

userSchema.virtual('userID').get(function() {
	return this._id;
});

userSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
});

var User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.schema = userSchema;