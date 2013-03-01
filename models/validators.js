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

var user = {
	validateName: validateName,
	validateEmail: validateEmail,
	validatePassword: validatePassword,
};

var passwordStrength = {
	validatePasswordStrong:	validatePasswordStrong,
	validatePasswordMedium: validatePasswordMedium,
	validatePasswordWeak: validatePasswordWeak,
};

exports.user = user;
exports.passwordStrength = passwordStrength;