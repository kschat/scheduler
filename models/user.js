var mongoose = require('mongoose');

/*mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', function callBack() {
	var userSchema = mongoose.Schema({
		name: String
	});

	//var User = mongoose('User', userSchema);
	//var testUser = new User('Test')
;	//console.log(testUser.name);
});*/

//mongoose.connect('mongodb://localhost/scheduler');

function validateName(val) {
	return val.length && val.length <= 35;
}

function validateEmail(val) {
	console.log(val);
	return false;
}

function validatePassword(val) {
	console.log(val);
	return false;
}

var userSchema = mongoose.Schema({
	firstName: { 
		type: String, 
		required: true,
		validate: [
			validateName, 'An error occured',
		],
	},
	lastName: {
		type: String, 
		required: true 
	},
	email: {
		type: String, 
		required: true, 
		index: {
			unique: true
		}
	},
	password: {
		type: String, 
		required: true 
	},
},
{
	collection: 'user'
});

userSchema.virtual('userID').get(function() {
	return this._id;
})

module.exports = mongoose.model('User', userSchema);