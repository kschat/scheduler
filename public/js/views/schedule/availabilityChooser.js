define([
	'jquery',
	'underscore',
	'backbone',
	'collections/timeRangeCollection',
	'text!templates/schedule/availabilityChooser.html',
	'text!templates/schedule/calendarPopup.html'
], function($, _, Backbone, TimeRangeCollection, Template, PopupTemplate) {
	var AvailabilityChooserView = Backbone.View.extend({
		initialize: function(options) {
			this.$selectedTime = null;
			this.dispatcher = options.dispatcher;
			this.collection = new TimeRangeCollection();

			this.timeValidation = /^(?:1[0-2]|[1-9]):[0-5][0-9](?:am|pm)$/;
			this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

			_.bindAll(this, 'render', 'handleVisibility', 'setUnavailable', 'cacheTime', 'validateTimes','convertToMilitary', 'parseTime',
				'disableSave', 'enableSave', 'detectChange', 'getRange', 'clearTemps');
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
		},
		el: '#availability-view',
		template: _.template(Template),
		events: {
			'click #calendar td.time-split': 'displayPopup',
			'click #save-btn': 'setUnavailable',
			'focus input[type="text"]': 'cacheTime',
			'blur input[type="text"]': 'validateTimes',
			'keyup input[type="text"]': 'detectChange'
		},
		render: function() {
			var self = this,
				popupTemp = _.template(PopupTemplate);
			this.$el.html(this.template());
			this.$el.find('.trigger-popover').each(function() {
				$(this).popover({ 
					trigger: 'manual',
					placement: 'top',
					html: true,
					//closure swag
					title: (function(days) {
						return function() {
							return '<strong>' + days[$(this).data('day')] + '</strong>';
						}
					})(self.days),
					//more closure swag
					content: (function(template) {
						return function() {
							var time = $(this).data('time'),
								hour = parseInt(time.split(':')[0], 10),
								minutes = time.split(':')[1],
								ampm = time.substring(time.length-2);


							minutes = minutes.substring(0, minutes.length-2);
							console.log(minutes);
							if(hour === 11) {
								ampm = ampm.toLowerCase() === 'am' ? 'pm' : 'am';
							}

							hour = hour === 12 ? 0 : hour;
							temp = (hour + 1) + ':00' + ampm;

							return template({ 
								startTime: time,
								endTime: hour + 1 + ':' + minutes + ampm});
						}
					})(popupTemp)
				});
			});

			return this;
		},
		convertToMilitary: function(time) {
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
		},
		parseTime: function(time) {
			time = time.toUpperCase().trim();

			return {
				ampm: time.split(':')[1].match(/[AP]\.?M\.?/i)[0],
				hours: time.split(':')[0],
				minutes: time.split(':')[1].match(/[0-9]+/)[0]
			};
		},
		handleVisibility: function(e, page) {
			if(page === 'availability') {
				this.$el.slideDown(800);
				this.dispatcher.trigger('pager:enableBtn', 'previous');
				this.dispatcher.trigger('pager:enableBtn', 'next');
				this.dispatcher.trigger('pager:setHref', 'previous', '#add-classes');
				this.dispatcher.trigger('pager:setHref', 'next', '#generate-schedule');
			}
			else {
				this.$el.hide();
			}
		},
		displayPopup: function(e) {
			if(e.target.className === 'trigger-popover') {
				//Saftey check to determine if there were any selected elements before this one
				this.$selectedTime = this.$selectedTime || $(e.target);

				this.$selectedTime.removeClass('selected-time-temp').popover('hide');
				this.$el.find('.selected-time-temp').removeClass('selected-time-temp');

				//Sets the selected element to the element that was just clicked.
				this.$selectedTime = $(e.target);

				this.$selectedTime.addClass('selected-time-temp').popover('show');
				var nextHour = this.$selectedTime.nextAll('.trigger-popover');

				if(nextHour.length === 0) {
					var day = this.$selectedTime.data('day');
					//This obscene selector is something I am not very proud of.
					this.$selectedTime
						.parent()
						.parent()
						.next()
						.children('[data-day="' + day + '"]')
						.children()
						.first()
						.addClass('selected-time-temp');
				}
				else {
					nextHour.addClass('selected-time-temp');
				}
			}
		},
		cacheTime: function(e) {
			this.cachedTime = $(e.target).val();
		},
		validateTimes: function(e) {
			if(!this.timeValidation.test($(e.target).val().toLowerCase())) {
				$(e.target).val(this.cachedTime).focus();
				this.disableSave();
				return false;
			}

			var sTime = this.$el.find('#start-time').val(),
				eTime = this.$el.find('#end-time').val();

			//Safe guard against users inputing a start time that begins after the end time
			if(this.convertToMilitary(sTime) > this.convertToMilitary(eTime)) {
				$(e.target).focus();
				this.disableSave();
				return false;
			}

			//Checks against max values for start and end time
			if(parseInt(this.convertToMilitary(eTime)) > 2300) {
				$(e.target).val('11:00pm');
			}

			if(parseInt(this.convertToMilitary(sTime)) > 2230) {
				$(e.target).val('10:30pm');
			}

			//Checks against min values for start and end time
			if(parseInt(this.convertToMilitary(eTime)) < 630) {
				$(e.target).val('6:30am');
			}

			if(parseInt(this.convertToMilitary(sTime)) < 600) {
				$(e.target).val('6:00am');
			}

			//Updates the cached value once everything is validated
			this.cachedTime = $(e.target).val();
			
			var sTime = this.$el.find('#start-time').val(),
				eTime = this.$el.find('#end-time').val(),
				sday = this.$selectedTime.data('day'),
				times = this.getRange(sTime, eTime);

			times.pop();
			this.clearTemps();
			this.setRangeState(times, sday, 'selected-time-temp');
			this.enableSave();
			return true;
		},
		setUnavailable: function(e) {
			e.preventDefault();

			var sTime = this.$el.find('#start-time').val(),
				eTime = this.$el.find('#end-time').val(),
				sday = this.$selectedTime.data('day'),
				times = this.getRange(sTime, eTime);

			this.collection.add({startTime: times[0], endTime: times.pop()});

			this.setRangeState(times, sday, 'selected-time');
			this.$selectedTime.removeClass('selected-time-temp').popover('hide');

			console.log(this.collection);
		},
		setRangeState: function(range, day, state) {
			for(var i=0; i<range.length; i++) {
				this.$el.find('[data-time="' + range[i]  + '"][data-day="' + day + '"]').removeClass('selected-time-temp').addClass(state);
			}
		},
		getRange: function(time1, time2) {
			var curr = time1,
				range = [time1];
			while(curr !== time2) {
				var temp = curr;
				temp = temp.replace('00', '30');
				if(temp === curr) {
					var hour = parseInt(curr.split(':')[0], 10),
						ampm = curr.substring(curr.length - 2);
					
					if(hour === 11) {
						ampm = ampm.toLowerCase() === 'am' ? 'pm' : 'am';
					}
					hour = hour === 12 ? 0 : hour;
					temp = (hour + 1) + ':00' + ampm;
					console.log(temp);
				}
				range.push(temp);
				curr = temp;
			}

			return range;
		},
		clearTemps: function() {
			this.$el.find('.selected-time-temp').removeClass('selected-time-temp');
		},
		disableSave: function() {
			this.$el.find('#save-btn').attr('disabled', 'disabled');
		},
		enableSave: function() {
			this.$el.find('#save-btn').removeAttr('disabled');
		},
		detectChange: function(e) {
			var content = $(e.target).val();

			if(this.cachedTime !== content) {
				this.disableSave();
			}
		}
	});

	return AvailabilityChooserView;
});