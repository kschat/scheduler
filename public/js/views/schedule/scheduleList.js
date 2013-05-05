define([
	'jquery',
	'underscore',
	'backbone',
	'models/schedule',
	'models/course',
	'views/schedule/schedule',
	'views/loader/loading',
	'collections/scheduleCollection',
	'text!templates/schedule/scheduleList.html'
], function($, _, Backbone, ScheduleModel, CourseModel, ScheduleView, LoadingOverlay, ScheduleCollection, Template) {
	var ScheduleListView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render', 'resetList', 'fetchUser', 'fetchScheduleSuccess');
			this.dispatcher = options.dispatcher;
			this.model.on('change', this.resetList, this);

			this.fetchUser();
		},
		el: '#schedule-list-container',
		template: _.template(Template),
		events: {
		},
		render: function() {
			this.$el.html(this.template());
			this.$message = this.$el.find('#schedule-list-message');
			this.$list = this.$el.find('#schedule-list');
			return this;
		},
		resetList: function() {
			if(this.model.attributes.schedules.length > 0) {
				this.$list.html('');
				this.$message.hide();
				var self = this;

				_.each(this.model.attributes.schedules, function(schedule) {
					var ts = new ScheduleModel(schedule);
					ts.fetch({ populate: 'courses',
						success: self.fetchScheduleSuccess,
						error: function(data) {
						}
					});
				});

				this.$list.fadeIn(700);
			}
			else {
				this.$list.hide();
				this.$message.html('<strong>This user currently has no schedules saved.</strong>').show();
			}

			return this;
		},
		fetchScheduleSuccess: function(data) {
			var cv = new ScheduleView({ model: new ScheduleModel(data.attributes[0]), dispatcher: this.dispatcher });
			this.$list.append(cv.render().el);
		},
		fetchUser: function() {
			this.model.fetch({ populate: 'schedules' }, {
				success: this.fetchSuccess,
				error: function(res) {
				}
			});
		},
		fetchSuccess: function(res) {
		}
	});

	return ScheduleListView;
});