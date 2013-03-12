var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	Course = require('./course'),
	Schema = mongoose.Schema;

var scheduleSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	courses: [{
		type: Schema.Types.ObjectId,
		ref: 'Course',
	}],
});

var Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
module.exports.schema = scheduleSchema;