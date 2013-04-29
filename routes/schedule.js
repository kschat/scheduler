var mongoose = require('mongoose'),
	Course = require('../models/course'),
	_ = require('underscore');

function parseDays(date) {
	return date.days.split(',');
}

function classOverlap(d1, d2) {
	//Each set of times for date1
	for(var y=0; y<d1.length; y++) {
		//Each set of times for date2
		for(var z=0; z<d2.length; z++) {
			var date1 = d1[y],
				date2 = d2[z],
				d1Days = parseDays(date1),
				d2Days = parseDays(date2);
			//date1 days
			for(var i=0; i<d1Days.length; i++) {
				//date2 days
				for(var x=0; x<d2Days.length; x++) {
					//If the days collide, test if the times do
					if(d1Days[i] === d2Days[x]) {
						var t1start = date1.times.split('-'),
							t1end = t1start[1].trim(),
							t2start = date2.times.split('-'),
							t2end = t2start[1].trim();

						t1start = t1start[0];
						t2start = t2start[0];
						
						if(timeOverlap(t1start, t1end, t2start, t2end)) {
							return true;
						}
					}
				}
			}
		}
	}
	return false;
}

function timeOverlap(timeStart1, timeEnd1, timeStart2, timeEnd2) {
	if(timeStart1 <= timeEnd2 && timeEnd1 >= timeStart2) { return true; }

	return false;
}

function convertToMilitary(time) {
	time = this.parseTime(time);
	var hour = time.hours,
		minute = time.minutes,
		ampm = time.ampm;

	if(isNaN(hour) || isNaN(minute) || !isNaN(ampm)) { throw new Error('Incorrect format'); }

	ampm = ampm.toUpperCase().trim();
	hour = hour.trim();

	var iHour = parseInt(hour, 10),
		iMinute = parseInt(minute, 10),
		mHour = '';

	if(iHour > 12 || iHour < 1 || iMinute > 60 || iMinute < 0) { throw new Error('Time out of range'); }

	if(ampm === 'A.M.' || ampm === 'AM') {
		mHour = (hour === '12') ? '00' : (iHour < 10 && iHour > 0) ? '0' + hour : hour;
	}
	else if(ampm === 'P.M.' || ampm === 'PM') {
		mHour = (hour === '12') ? hour : iHour + 12;
	}
	else {
		throw new Error('Incorrect format');
	}

	return mHour + minute;
}

function parseTime(time) {
	time = time.toUpperCase().trim();

	return {
		ampm: time.split(':')[1].match(/[AP]\.?M\.?/i)[0],
		hours: time.split(':')[0],
		minutes: time.split(':')[1].match(/[0-9]+/)[0]
	};
}

function cartesianProductOf(){
	return _.reduce(arguments, function(mtrx, vals){
		return _.reduce(vals, function(array, val){
			return array.concat(
				_.map(mtrx, function(row){ return row.concat(val); })
			);
		}, []);
	}, [[]]);
}

exports.init = function init(app) {
	//Default options to pass to the layout template
	var options = {
			title: 'Scheduler',
			isPage: true,
			loggedIn: false,
			searchOn: false,
			links: {
				styles: [
					'/css/bootstrap.css',
					'/css/bootstrap-responsive.css',
					'/css/mainStyle.css',
					'/css/font-awesome.min.css',
				],
			},
		};

	app.get(/^\/schedule\/create\/?$/, function(req, res) {
		options.searchOn = true;
		options.loggedIn = req.session.loggedIn;
		options.currUser = 'kschat';
		//options.searchOn = true;
		res.render(app.get('views') + '/schedule/create', options);
	});

	app.post(/^\/schedule\/generate\/?$/, function(req, res) {
		var allCourses = [],
			courseNums = [],
			schedules = [];
		for(var i=0; i<req.body.courses.length; i++) {
			courseNums.push({courseNumber: req.body.courses[i].courseNumber});
		}

		//Get all sections of the courses sent to the server
		Course.find({ $or: courseNums }, function(err, courses) {
			if(err) { throw err; }

			//Split up courses based on course number
			var cCourse = courses[0],
				tempArr = [];
			for(var i=0; i<courses.length; i++) {
				if(cCourse.courseNumber === courses[i].courseNumber) {
					tempArr.push(courses[i]);
				}
				else {
					allCourses.push(tempArr);
					tempArr = [];
					tempArr.push(courses[i]);
					//console.log(tempArr);
				}
				cCourse = courses[i];
			}
			allCourses.push(tempArr);

			//Get all combinations of courses
			schedules = allCourses[0];
			for(var i=1; i<allCourses.length; i++) {
				schedules = cartesianProductOf(schedules, allCourses[i]);
			}

			for(var i=0; i<schedules.length; i++) {
				for(var x=0; x<schedules[i].length; x++) {
					console.log(schedules[i][x].courseNumber + '-' + schedules[i][x].section);
				}
				console.log('\n');
			}

			//Construct parallel array that contains just the times
			var times = [];
			for(var i=0; i<schedules.length; i++) {
				times[i] = [];
				for(var x=0; x<schedules[i].length; x++) {
					times[i][x] = schedules[i][x].days;
				}
			}
			console.log('===============================================');

			//Queue of the indices of schedules that need to be removed.
			var toRemove = [];
			//Each possible schedule
			for(var i=0; i<times.length; i++) {
				//Each class in that schedule
				for(var x=0; x<times[i].length; x++) {
					var xTimes = times[i][x];
					//All the other classes in that schedule to compare against the outer loop
					for(var y=x+1; y<times[i].length; y++) {
						var yTimes = times[i][y];
						if(classOverlap(xTimes, yTimes)) {
							console.log(true);
							toRemove.unshift(i);
						}
						else { console.log(false);}
					}
				}
			}

			//Goes through the queue of schedules that need to be removed
			for(var i=0; i<toRemove.length; i++) {
				schedules.splice(toRemove[i], 1);
			}

			console.log('===============================================');
			for(var i=0; i<schedules.length; i++) {
				for(var x=0; x<schedules[i].length; x++) {
					console.log(schedules[i][x].courseNumber + '-' + schedules[i][x].section);
				}
				console.log('\n');
			}

			res.send(schedules);
		});
	});
};