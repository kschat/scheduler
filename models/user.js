var mongoose = require('mongoose'),
	_ = require('underscore');

mongoose.connect('mongodb://localhost/scheduler');

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

function limit(max) {
	this.find({}, function(err, docs) {
		//console.log(docs);
		results = _.intersection(results, docs);
		console.log(results);
	});
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
			//{ validator: validatePasswordWeak, msg: 'Password is not weak' },
			//{ validator: validatePasswordMedium, msg: 'Password is not medium' },
			{ validator: validatePasswordStrong, msg: 'Password is not strong' },
		],
	},
},
{
	collection: 'user'
});

userSchema.virtual('userID').get(function() {
	return this._id;
});

userSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
});

var results = [];

module.exports = mongoose.model('User', userSchema);
module.exports.limit = limit;