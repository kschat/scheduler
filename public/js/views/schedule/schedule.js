define([
	'jquery',
	'underscore',
	'backbone',
	'models/schedule',
	'views/loader/loading',
	'text!templates/schedule/schedule.html',
	'text!templates/schedule/editSchedule.html'
], function($, _, Backbone, ScheduleModel, LoadingOverlay, Template, EditTemplate) {
	var ScheduleView = Backbone.View.extend({
		initialize: function(options) {
			this.template = options.edit ? _.template(EditTemplate) : _.template(Template);
			_.bindAll(this, 'render');
			this.dispatcher = options.dispatcher;
		},
		render: function() {
			this.model.attributes.cid = this.model.cid || '';
			this.$el.html(this.template(this.model.attributes));
			//this.loading = new LoadingOverlay({ dispatcher: this.dispatcher });

			return this;
		}
	});

	return ScheduleView;
});