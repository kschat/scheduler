define([
	'jquery',
	'underscore',
	'backbone',
	'views/schedule/schedule',
	'models/schedule',
	'models/user',
	'text!templates/schedule/saveSchedules.html'
], function($, _, Backbone, ScheduleView, Schedule, User, Template) {
	var ScheduleSaveView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;

			_.bindAll(this, 'render', 'handleVisibility', 'resetSchedules', 'saveSchedules', 'saveSuccess', 'saveError');
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);

			this.collection.on('reset', this.resetSchedules);
			this.collection.on('add', this.resetSchedules);
			this.collection.on('remove', this.resetSchedules);
			this.collection.on('change', this.resetSchedules);
		},
		el: '#save-schedules',
		template: _.template(Template),
		events: {
		},
		render: function() {
			this.$el.html(this.template());
			this.$scheduleList = this.$el.find('#saved-schedules');

			//Get the current user from the server
			this.user = new User({ _id: this.$el.data('user') });
			this.user.fetch({ 
				success: function(data) { 
					console.log(data); 
				}, 
				error: function() { 
					console.log('err');
				}
			});

			return this;
		},
		resetSchedules: function() {
			if(this.collection.length > 0) {
				this.$scheduleList.html('');
				var self = this;

				this.collection.each(function(course) {
					var sv = new ScheduleView({ model: course, dispatcher: self.dispatcher, edit: false });
					self.$scheduleList.append(sv.render().el);
				});
			}
		},
		saveSchedules: function() {
			var self = this;
			this.collection.each(function(schedule) {
				//Creates a new schedule that contains an array of course ObjectID's rather than models to send to the server
				var serverSchedule = new Schedule({
					title: schedule.get('title'), 
					user: self.user,
					courses: []
				});

				for(var i=0; i<schedule.attributes.courses.length; i++) {
					serverSchedule.attributes.courses[i] = schedule.attributes.courses[i]._id;
				}

				serverSchedule.save({}, {
					success: self.saveSuccess,
					error: self.saveError
				});
			});
		},
		saveSuccess: function(data) {
			var self = this,
				tempSchedules = this.user.get('schedules');
			
			tempSchedules.push(data.id);
			this.user.save({ schedules: tempSchedules }, {
				error: function(d) {
					//If an error occurs try saving again.
					self.user.save({ schedules: tempSchedules }); 
				}
			});
		},
		saveError: function(data) {
			console.log('err');
		},		
		handleVisibility: function(e, page) {
			if(page === 'save-schedule') {
				this.$el.slideDown(800);
				this.dispatcher.trigger('pager:disableBtn', 'next');
				this.dispatcher.trigger('pager:disableBtn', 'previous');
				this.saveSchedules();
			}
			else {
				this.$el.hide();
			}
		}
	});

	return ScheduleSaveView;
});