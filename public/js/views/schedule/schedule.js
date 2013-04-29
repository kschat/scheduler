define([
	'jquery',
	'underscore',
	'backbone',
	'models/schedule',
	'views/loader/loading',
	'text!templates/schedule/schedule.html'
], function($, _, Backbone, ScheduleModel, LoadingOverlay, Template) {
	var GenerateScheduleView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render');
			this.dispatcher = options.dispatcher;
		},
		template: _.template(Template),
		render: function() {
			//console.log(this.model.attributes);
			this.$el.html(this.template(this.model.attributes));
			//this.loading = new LoadingOverlay({ dispatcher: this.dispatcher });

			return this;
		}
	});

	return GenerateScheduleView;
});