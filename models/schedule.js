var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	Course = require('./course'),
	Schema = mongoose.Schema;

/**
* Schedule mongo schema
*
* @param {String} title custom label for schedule
* @param {Array} courses list of references to course models
*/
var scheduleSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	title: {
		type: String,
		required: true,
	},
	courses: [{
		type: Schema.Types.ObjectId,
		ref: 'Course'
	}]
});

var Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
module.exports.schema = scheduleSchema;