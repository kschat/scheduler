var mongoose = require('mongoose'),
	_ = require('underscore');

var testSchema = mongoose.Schema({
	test: {type: String}
});

var Test = mongoose.model('Test', testSchema);

module.exports = Test;