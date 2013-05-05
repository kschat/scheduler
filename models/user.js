var mongoose = require('mongoose'),
	Schedule = require('./schedule'),
	bcrypt = require('bcrypt'),
	fs = require('fs'),
	Schema = mongoose.Schema;

/**
* Determines if a name is between 1 and 36 characters
*
* @param {String} val name to validate
* @return {Boolean} true if valide; false otherwise
*/
function validateName(val) {
	return val.length >= 2 && val.length <= 35;
}

/**
* Determines if an email matches <address>@<provider>.<subDomain>
*
* @param {String} val email to validate
* @return {Boolean} true if valide; false otherwise
*/
function validateEmail(val) {
	return /^.+@.+\..+$/.test(val);
}

/**
* Determines if a pasword is at least 4 characters long
*
* @param {String} val password to validate
* @return {Boolean} true if valide; false otherwise
*/
function validatePassword(val) {
	return val.length > 3;
}

/**
* Determines if a password contains special characters and is 13 characters long
*
* @param {String} val password to validate
* @return {Boolean} true if valide; false otherwise
*/
function validatePasswordStrong(val) {
	var hasSpecialCharacter = /[^a-z ]/.test(val);

	return validatePassword(val) && (
			(val.length > 12 && hasSpecialCharacter) || 
			(val.length > 20)
		);
}

/**
* Determines if a password contains special characters and is at least 8 characters long
*
* @param {String} val password to validate
* @return {Boolean} true if valide; false otherwise
*/
function validatePasswordMedium(val) {
	var hasSpecialCharacter = /[^a-z ]/.test(val);

	return validatePassword(val) && (
				(val.length > 10 && val.length < 21) || 
				(val.length > 7 && val.length < 13 && hasSpecialCharacter)
			);
}

/**
* Determines if a password is less than 8 characters long
*
* @param {String} val password to validate
* @return {Boolean} true if valide; false otherwise
*/
function validatePasswordWeak(val) {
	return validatePassword(val) && val.length < 8;
}

/**
* Picture mongo schema
*
* @param {Buffer} data binary representation of the image
* @param {String} filename path of the image
*/
var PictureSchema = mongoose.Schema({
	data: {
		type: Buffer
	},
	filename: {
		type: String,
		default: 'img/defaultProfile.jpg',
		required: true
	}
});

/**
* User mongo schema
*
* @param {String} firstName users first name
* @param {String} lastName users last name
* @param {String} userName users username
* @param {String} description personal description on users profile
* @param {String} email users email address
* @param {String} password encrypted password
* @param {Array} avatar list of Picture models
*/
var userSchema = mongoose.Schema({
	firstName: { 
		type: String, 
		required: true,
		validate: [
			validateName, 'Error with first name'
		]
	},
	lastName: {
		type: String, 
		required: true,
		validate: [
			validateName, 'Error with last name'
		]
	},
	userName: {
		type: String, 
		required: true,
		index: {
			unique: true
		}
	},
	description: {
		type: String,
		required: false,
		default: 'No description'
	},
	email: {
		type: String, 
		required: true, 
		index: {
			unique: true,
		},
		validate: [
			validateEmail, 'Error with email address'
		]
	},
	password: {
		type: String, 
		required: true,
		validate: [
			{ validator: validatePassword, msg: 'Password too short' }
		]
	},
	avatar: {
		type: [PictureSchema]
	},
	schedules: [{
		type: Schema.Types.ObjectId,
		ref: 'Schedule'
	}]
},
{
	collection: 'user'
});

/**
* Middleware for saving a model
* Encrypts the password
*/
userSchema.pre('save', function(next) {
	var user = this;

	//Password pre-save
	if(!user.isModified('password')) { return next(); }

	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) { return next(err); }

			user.password = hash;
			next();
		});
	});
});

/**
* Middleware for saving a model
* writes the image uploaded to the server
*/
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('avatar')) { return next(); }

	var imageName = user.avatar[0].filename,
		imageBuffer = user.avatar[0].data || '',
		uploadPath = 'public/img/uploads/' + user.userName,
		dataRegex = /^data:.+\/(.+);(.+),(.*)$/,
		matches = imageBuffer.toString().match(dataRegex);
	
	//Checks if the user already has a file containing their uploads, creates one if they don't.
	fs.exists(uploadPath, function(exists) {
		if(!exists) { 
			fs.mkdirSync(uploadPath);
			
			var inStr = fs.createReadStream('public/img/defaultProfile.jpg'),
				outStr = fs.createWriteStream(uploadPath + '/defaultProfile.jpg');
			inStr.pipe(outStr);
		}
	});

	//If there are no matches then the file isn't a new upload.
	if(!matches) { return next(); }

	var ext = matches[1],
		encoding = matches[2],
		data = matches[3];

	//Converts jpeg to jpg for consistancy
	ext = ext === 'jpeg' ? 'jpg' : ext;

	//Takes off the file extension in favor of the ext sent with the data url
	imageName = imageName.substring(0, imageName.lastIndexOf('.'));

	//Creates a buffer that only contains the image data
	data = new Buffer(data, encoding);

	//Writes the upload image to their upload directory
	fs.writeFile(uploadPath + '/' + imageName + '.' + ext, data, function(err) {
		if(err) { return next(err); }

		//Resave the the image name to the unique name
		user.avatar[0].filename = imageName + '.' + ext;
		next();
	});
});

/**
* Model method used to compare two passwords
*
* @param {String} candidatePassword password to compare against
* @param {Function} callBack is passed err and isMatch used
*/
userSchema.methods.comparePassword = function(candidatePassword, callBack) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) { return callBack(err) };
        
        callBack(null, isMatch);
    });
};

/**
* Virtual method that creates an alias for _id as userID
*
* @return {String} ID of the user
*/
userSchema.virtual('userID').get(function() {
	return this._id;
});

/**
* Virtual method that creates an alias for firstName + lastName as fullName
*
* @return {String} full name of user
*/
userSchema.virtual('fullName').get(function() {
	return this.firstName + ' ' + this.lastName;
});

var User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.schema = userSchema;