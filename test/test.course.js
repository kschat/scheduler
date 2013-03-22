var should = require('should'),
	mongoose = require('mongoose'),
	Course = require('../models/course');

describe('Course model', function() {
	//mongoose.connect('mongodb://localhost/scheduler');
	var course,
	db = mongoose.connection;

	beforeEach(function(done) {
		db.collections['courses'].drop(function(err) {
			if(err) throw err;
		});

		course = new Course({
			courseNumber: 	'CIT 480',
			instructor: 	'Dr. Golshan',
			days: 			[
				'Mon',
				'Tues'
			],
			times : 		[
				'9:00am - 11:00am'
			],
			location: 		'ATHS 205',
			credits: 		'3.00',
		});

		course.save(function(err, c) {
			if(err) throw err;
			done();
		});
	});

	after(function(done) {
		db.close();
		done();
	});

	describe('Add a course', function() {
		it('should ', function(done) {
			Course.findOne({}, function(err, c) {
				console.log(c);
				done();
			});
		});
	});
});