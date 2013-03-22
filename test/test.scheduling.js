var should = require('should');

var dateOne = {
		tues: [
			'2:00P.M. - 3:30P.M.'
		],
		thurs: [
			'12:00P.M. - 1:30P.M.'
		]
	},
	dateTwo = {
		mon: [
			'9:30A.M. - 11:00A.M.'
		],
		thurs: [
			'12:00P.M. - 2:00P.M.'
		]
	};

function classOverlap(date1, date2) {
	for(var day in date1) {
		if(!date1.hasOwnProperty(day)) { continue; }

	}
}

function timeOverlap(timeStart1, timeEnd1, timeStart2, timeEnd2) {
	if(timeStart1 <= timeEnd2 && timeEnd1 >= timeStart2) { return true; }

	return false;
}

function convertToMilitary(ampm, hour, minute) {
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
		hours: time.split(':')[0],
		minutes: time.split(':')[1].match(/[0-9]+/)[0],
		ampm: time.split(':')[1].match(/[AP]\.?M\.?/i)[0]
	};
}

describe('Scheduling algorthim', function() {
	describe('Test parseTime function', function() {
		it('should equal 12', function() {
			parseTime(dateOne.thurs[0].split(' - ')[0]).hours.should.equal('12');
		});

		it('should equal 00', function() {
			parseTime(dateOne.thurs[0].split(' - ')[0]).minutes.should.equal('00');
		});

		it('should equal P.M.', function() {
			parseTime(dateOne.thurs[0].split(' - ')[0]).ampm.should.equal('P.M.');
		});

		it('should equal AM', function() {
			parseTime('7:00am').ampm.should.equal('AM');
		});
	});

	describe('Test military time conversion', function() {
		it('should equal 0100', function() {
			convertToMilitary('am', '1', '00').should.equal('0100');
		});

		it('should equal 0714', function() {
			convertToMilitary('am', '7', '14').should.equal('0714');
		});

		it('should equal 0000', function() {
			convertToMilitary('am', '12', '00').should.equal('0000');
		});

		it('should equal 1200', function() {
			convertToMilitary('pm', '12', '00').should.equal('1200');
		});

		it('should equal 1500', function() {
			convertToMilitary('pm', '3', '39').should.equal('1539');
		});

		it('should equal 2300', function() {
			convertToMilitary('pm', '11', '00').should.equal('2300');
		});

		it('should throw an error "Incorrect format"', function() {
			(function() {
				convertToMilitary('zm', '11', '00');
			}).should.throw('Incorrect format');
		});

		it('should throw an error "Incorrect format"', function() {
			(function() {
				convertToMilitary('am', 'z', '00');
			}).should.throw('Incorrect format');
		});

		it('should throw an error "Incorrect format"', function() {
			(function() {
				convertToMilitary('am', '12', 'z');
			}).should.throw('Incorrect format');
		});

		it('should throw an error "Incorrect format"', function() {
			(function() {
				convertToMilitary(1, '12', '00');
			}).should.throw('Incorrect format');
		});

		it('should throw an error "Time out of range"', function() {
			(function() {
				convertToMilitary('am', '13', '00');
			}).should.throw('Time out of range');
		});

		it('should throw an error "Time out of range"', function() {
			(function() {
				convertToMilitary('am', '12', '70');
			}).should.throw('Time out of range');
		});
	});

	describe('Test time overlap', function() {
		it('should not overlap', function() {
			timeOverlap('0100', '0230', '0330', '0430').should.be.false;
		});

		it('should overlap', function() {
			timeOverlap('0100', '0230', '0130', '0430').should.be.true;
		});
	});
});