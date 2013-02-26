var mongoose = require('mongoose');

/*mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open', function callBack() {
	var userSchema = mongoose.Schema({
		name: String
	});

	//var User = mongoose('User', userSchema);
	//var testUser = new User('Test');
	//console.log(testUser.name);
});*/

var userSchema = mongoose.Schema({
	name: String
});

exports.User = mongoose.model('User', userSchema);