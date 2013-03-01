'use strict'

var validator = require('../models/validators'),
	assert = require('assert'),
	should = require('should');

var userValidator = validator.user,
	pwStrengthValidator = validator.passwordStrength,
	samplePassword = 'testpassWord12#testpassword',
	testPassword = {
		invalid: 	samplePassword.substring(0,3),
		valid: 		samplePassword.substring(0,4),
		weak: 		samplePassword.substring(0,8),
		medium: 	samplePassword.substring(0,12),
		strong: 	samplePassword,
	};

//Helper function to get offset arguments
function getOffsetArguments(arr, offset) {
	var limit = typeof arguments[2] === 'number' ? arguments[2] : arguments.length,
		offsetArray = [];

	for(var i=offset; i<limit; i++) {
		if(typeof arr[i] !== 'undefined') {
			offsetArray.push(arr[i]);
		}
	}

	return offsetArray;
}

function testValidateName() {
	it('should return false when the name is less than 2 or greater than 35', function() {
		userValidator.validateName('').should.equal(false);
		userValidator.validateName('this is a really long name that is over 35 characters').should.equal(false);
	});

	it('should return true for "Kyle" and "Ty"', function() {
		userValidator.validateName('Kyle').should.equal(true);
		userValidator.validateName('Ty').should.equal(true);
	});
}

function testValidateEmail() {
	it('should return false when there is no "@" simple present', function() {
		userValidator.validateEmail('emailtest.com').should.equal(false);
	});

	it('should return false when there aren\'t any characters preceeding the "@" symbol', function() {
		userValidator.validateEmail('@test.com').should.equal(false);
	});

	it('should return false when there aren\'t any characters after the "@" symbol', function() {
		userValidator.validateEmail('email@.com').should.equal(false);
	});

	it('should return false when there aren\'t any characters after the "."', function() {
		userValidator.validateEmail('email@.').should.equal(false);
	});

	it('should return true when the email follows the format <string>@<string>.<string>', function() {
		userValidator.validateEmail('email@test.com').should.equal(true);
	});
}

function testValidatePassword(validPassword, testPassword) {

	return function() {
		it('should return false when the password is empty', function() {
			userValidator.validatePassword('').should.equal(false);
		});

		it('should return false when the password is shorter than 4 characters', function() {
			userValidator.validatePassword(testPassword.substring(0,1)).should.equal(false);
			userValidator.validatePassword(testPassword.substring(0,2)).should.equal(false);
			userValidator.validatePassword(testPassword.substring(0,3)).should.equal(false);
		});

		it('should return true when a valid password is passed to it', function() {
			userValidator.validatePassword(validPassword).should.equal(true);
		});
	}
}

function testValidatePasswordWeak(validPassword, testPassword) {

	return function() {
		it('should return false when the password is greater than 8 characters', function() {
			pwStrengthValidator.validatePasswordWeak(testPassword.substring(0,9)).should.equal(false);
		});
	}
}

function testValidatePasswordMedium(validPassword, testPassword) {

	return function() {
		it('should return false when the password is less than 8 characters', function() {
			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,7))
				.should.equal(false, 'Failed on 1st test: ' + testPassword.substring(0,7));
		});

		it('should return false when the password is greater than 20 characters', function() {

			pwStrengthValidator.validatePasswordMedium(testPassword)
				.should.equal(false, 'Failed on 1st test: ' + testPassword);
		});

		it('should return false when the password is greater than 20 characters and contains special ' + 
			'characters, numbers or upper case letters.', function() {

			pwStrengthValidator.validatePasswordMedium(testPassword)
				.should.equal(false, 'Failed on 1st test: ' + testPassword);
		});

		it('should return false when the password is 8 - 10 characters and doesn\'t contain a special ' +
			'character, number or upper case letter', function() {

			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8))
				.should.equal(false, 'Failed on 1st test: ' + testPassword.substring(0,8));

			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8) + 'w')
				.should.equal(false, 'Failed on 2st test: ' + testPassword.substring(0,9) + 'w');

			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8))
				.should.equal(false, 'Failed on 3st test: ' + testPassword.substring(0,8) + 'wo');
		});

		it('should return true when the password is 11 - 20 characters and only contains lowercase letters', function() {
			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8) + testPassword.substring(9,12))
				.should.equal(true, 'Failed on 1st test: ' + testPassword.substring(0,8) + testPassword.substring(9,12));

			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8) + testPassword.substring(9,13))
				.should.equal(true, 'Failed on 2st test: ' + testPassword.substring(0,8) + testPassword.substring(9,13));

			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8) + testPassword.substring(16))
				.should.equal(true, 'Failed on 3st test: ' + testPassword.substring(0,8) + testPassword.substring(16));

			pwStrengthValidator.validatePasswordMedium(testPassword.substring(0,8) + testPassword.substring(15))
				.should.equal(true, 'Failed on 4st test: ' + testPassword.substring(0,8) + testPassword.substring(15));
		});

		it('should return true when the password is 8 - 12 characters and contains a special character, number or upper case letter', function() {
			pwStrengthValidator.validatePasswordMedium(
				testPassword.substring(0,9)).should.equal(true, 'Failed on 1st test: ' + testPassword.substring(0,9));

			pwStrengthValidator.validatePasswordMedium(
				testPassword.substring(0,9) + '#').should.equal(true, 'Failed on 2st test: ' + testPassword.substring(0,9) + '#');

			pwStrengthValidator.validatePasswordMedium(
				testPassword.substring(0,9) + '1').should.equal(true, 'Failed on 3st test: ' + testPassword.substring(0,9) + '1');

			pwStrengthValidator.validatePasswordMedium(
				testPassword.substring(0,9) + '111').should.equal(true, 'Failed on 3st test: ' + testPassword.substring(0,9) + '111');
		});
	}
}

function testValidatePasswordStrong(validPassword, testPassword) {

	return function() {
		it('should return false when the password is less than 12 characters.', function() {
			pwStrengthValidator.validatePasswordStrong(testPassword.substring(0,11))
				.should.equal(false, 'Failed on 1st test: ' + testPassword.substring(0, 11));
		});

		it('should return false when the password is 12 - 20 characters and doesn\'t contain any ' +
			'special characters, numbers or upper case letters.', function() {

			pwStrengthValidator.validatePasswordStrong(testPassword.substring(15,26))
				.should.equal(false, 'Failed on 1st test: ' + testPassword.substring(15, 26));
		});

		it('should return true when the password is greater than 12 characters and does contain special ' +
			'characters, numbers or upper case letters.', function() {
			pwStrengthValidator.validatePasswordStrong(testPassword.substring(0,13))
				.should.equal(true, 'Failed on 1st test: ' + testPassword.substring(0, 13));

			pwStrengthValidator.validatePasswordStrong(testPassword)
				.should.equal(true, 'Failed on 1st test: ' + testPassword);
		});

		it('should return true when the password is greater than 20 characters', function() {
			
		});
	}
}

describe('validators', function() {
	describe('#validateName(val)', testValidateName);

	describe('#validateEmail(val)', testValidateEmail);

	describe('#validatePassword(val)', testValidatePassword(testPassword.valid, samplePassword));

	//Object used to determine if the a valid password meets certain criteria
	describe('validatePasswordStrength', function() {
		describe('#validatePasswordWeak(val)', testValidatePasswordWeak(testPassword.weak, samplePassword));
		describe('#validatePasswordMedium(val)', testValidatePasswordMedium(testPassword.medium, samplePassword));
		describe('#validatePasswordStrong(val)', testValidatePasswordStrong(testPassword.strong, samplePassword));
	});
});