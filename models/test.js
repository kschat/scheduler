var mongoose = require('mongoose'),
	_ = require('underscore');

mongoose.connect('mongodb://localhost/scheduler');

var testSchema = mongoose.Schema({
	test: {type: String}
});

var Test = mongoose.model('Test', testSchema);

module.exports = Test;