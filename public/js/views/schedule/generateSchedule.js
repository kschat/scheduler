define([
	'jquery',
	'underscore',
	'backbone',
	'views/schedule/courseSearchItem',
	'views/schedule/schedule',
	'views/loader/loading',
	'collections/scheduleCollection',
	'text!templates/schedule/generateSchedule.html',
], function($, _, Backbone, CourseSearchItem, ScheduleView, LoadingOverlay, ScheduleCollection, Template) {
	var GenerateScheduleView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render', 'handleVisibility', 'resetList', 'resetSchedules', 'generate', 'scheduleSent');
			this.dispatcher = options.dispatcher;
			this.schedules = new ScheduleCollection();


			//Events called by the search view notifying this view of its state
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
			this.collection.on('add', this.resetList, this);
			this.collection.on('reset', this.resetList, this);

			this.schedules.on('add', this.resetSchedules, this);
			this.schedules.on('reset', this.resetSchedules, this);			
		},
		el: '#generate-schedule',
		template: _.template(Template),
		events: {
			'click #generate-btn': 'generate'
		},
		render: function() {
			this.$el.html(this.template());
			this.$message = this.$el.find('#schedule-message');
			this.$list = this.$el.find('#picked-course-list');
			this.$scheduleList = this.$el.find('#schedules');
			//this.loading = new LoadingOverlay({ dispatcher: this.dispatcher, el: '#schedule-loading' });
			return this;
		},
		resetList: function() {
			if(this.collection.length > 0) {
				this.$list.html('');
				this.$message.hide();
				var self = this;

				this.collection.each(function(course) {
					var cv = new CourseSearchItem({ model: course, dispatcher: self.dispatcher });
					self.$list.append(cv.render().el);
				});

				this.$list.fadeIn(700);
			}
			else {
				this.$list.hide();
				this.$message.html('<strong>No classes were selected.</strong>').show();
			}

			return this;
		},
		resetSchedules: function() {
			console.log(this.schedules.length);
			if(this.schedules.length > 0) {
				this.$scheduleList.html('');
				var self = this,
					index = 0,
					begContainer = '',
					endContainer = '';

				this.schedules.each(function(course) {
					console.log(course);
					//begContainer = index % 2 === 0 ? '<div class="row-fluid"><div class="span4">' : '<div class="span4">';
					//endContainer = index % 2 === 0 ? '</div>' : '</div></div>';

					course.attributes.title = 'Schedule ' + (index + 1);
					var sv = new ScheduleView({ model: course, dispatcher: self.dispatcher });
					self.$scheduleList.append(sv.render().el);
					index++;
				});
			}
			else {
				this.$scheduleList.hide();
				this.$message.html('<h2 style="text-align: center;">No schedules could be created.</h2>').show();
			}
		},
		handleVisibility: function(e, page) {
			if(page === 'generate-schedule') {
				this.$el.slideDown(800);
				this.dispatcher.trigger('pager:enableBtn', 'next');
				this.dispatcher.trigger('pager:enableBtn', 'previous');
				this.dispatcher.trigger('pager:setHref', 'previous', '#availability');
			}
			else {
				this.$el.hide();
			}
		},
		generate: function() {
			/*this.collection.add([{
				"courseNumber":"CIT114",
				"section":"01",
				"courseTitle":"Gaming and Simulation Design Principles I",
				"credits":"3.00",
				"instructor":"KREPSHAW, R",
				"seats":12,
				"_id":"5160e3630f4d99a51700035f",
				"__v":0,
				"days":[
				{
				"days":"Tue,Thr",
				"location":"ATHS/E228",
				"times":"2:00P.M. - 3:30P.M.",
				"_id":"5160e3630f4d99a517000360"
				}]
			},
			{
				"courseNumber":"CIT160",
				"section":"01",
				"courseTitle":"Introduction to Programming",
				"credits":"3.00",
				"instructor":"LEETE, D",
				"seats":19,
				"_id":"5160e3630f4d99a517000363",
				"__v":0,
				"days":[
				{
				"days":"Tue,Thr",
				"location":"ATHS/E246",
				"times":"2:00P.M. - 3:30P.M.",
				"_id":"5160e3630f4d99a517000364"
				}]
			}]);*/

			//this.dispatcher.trigger('loading:start');
			$.ajax({
				url: '/schedule/generate',
				type: 'POST',
				dataType: 'JSON',
				data: { courses: this.collection.toJSON() },
				timeout: 4000
			}).done(this.scheduleSent);

			return false;
		},
		scheduleSent: function(data) {
			//this.schedules.reset();
			for(var i=0; i<data.length; i++) {
				this.schedules.add({courses: data[i] });
			}
			//this.dispatcher.trigger('loading:done');
			return false;
		}
	});

	return GenerateScheduleView;
});