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

var userSchema = mongoose.Schema({
	name: String,
	email: {type: String, required: true, index: {unique: true}}
});

userSchema.virtual('userID').get(function() {
	return this._id;
})

module.exports = mongoose.model('User', userSchema);