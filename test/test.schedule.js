var should = require('should'),
	mongoose = require('mongoose'),
	Schedule = require('../models/schedule'),
	Course = require('../models/course');

describe('Schedule model', function() {
	mongoose.connect('mongodb://localhost/scheduler');
	var schedule,
	db = mongoose.connection;

	beforeEach(function(done) {
		db.collections['schedules'].drop(function(err) {
			if(err) throw err;
		});

		schedule = new Schedule({
			title: 'test title',
		});

		schedule.save(function(err, sched) {
			done();
		});
	});

	describe('Add a course', function() {
		var course = new Course({
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

		it('should add a class to the schedule', function(done) {
			course.save(function(err) {
				if(err) throw err;
				schedule.courses.push(course._id);
				schedule.save(function(err) {
					if(err) throw err;
					Schedule.findOne({}).populate('courses').exec(function(err, c) {
						should.exist(c);
						done();
					});
				});
			});
		});
	});
});