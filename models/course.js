var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
* Day mongo schema
*
* @param {String} days string containing a comma delimited list of days
* @param {String} times string containing a comma delimited list of time ranges
* @param {String} location string containing a comma delimited list of locations
*/
var DaySchema = new Schema({
	days: {
		type: String,
		required: true
	},
	times: {
		type: String,
		required: true
	},
	location: {
		type: String,
		required: true
	}
});

/**
* Course mongo schema
*
* @param {String} courseNumber 6 character code to identify course
* @param {String} section identifies a specific section of a course
* @param {String} courseTitle actual title of the course
* @param {String} instructor professor teaching the specific course
* @param {Array} days array of day objects
* @param {String} credits amount of credit hours for the course
* @param {Number} seats available seats
*/
var courseSchema = new Schema({
	courseNumber: {
		type: String,
		required: true
	},
	section: {
		type: String,
		required: true
	},
	courseTitle: {
		type: String,
		required: true
	},
	instructor: {
		type: String,
		required: true
	},
	days: {
		type: [DaySchema],
		required: true
	},
	credits: {
		type: String,
		required: true
	},
	seats: {
		type: Number,
		required: true
	}
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;
module.exports.schema = courseSchema;