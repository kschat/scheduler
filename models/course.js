var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	Schema = mongoose.Schema;

var courseSchema = new Schema({
	courseNumber: {
		type: String,
		required: true,
	},
	instructor: {
		type: String,
		required: true,
	},
	days: {
		type: [],
		required: true,
	},
	times: {
		type: [],
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	credits: {
		type: String,
		required: true,
	},
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;