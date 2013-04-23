var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	fs = require('fs');

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

var PictureSchema = mongoose.Schema({
	data: {
		type: Buffer,
		required: true
	},
	filename: {
		type: String,
		required: true
	}
});

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
	}
},
{
	collection: 'user'
});

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

userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('avatar')) { return next(); }

	var imageName = user.avatar[0].filename,
		imageBuffer = user.avatar[0].data,
		uploadPath = 'public/img/uploads/' + user.userName,
		dataRegex = /^data:.+\/(.+);(.+),(.*)$/,
		matches = imageBuffer.toString().match(dataRegex);
	
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

	//Checks if the user already has a file containing their uploads, creates one if they don't.
	//Writes the upload image to their upload directory
	fs.exists(uploadPath, function(exists) {
		if(!exists) { 
			fs.mkdirSync(uploadPath);
		}

		fs.writeFile(uploadPath + '/' + imageName + '.' + ext, data, function(err) {
			if(err) { return next(err); }

			//Resave the the image name to the unique name
			user.avatar[0].filename = imageName + '.' + ext;
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