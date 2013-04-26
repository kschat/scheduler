define([
	'jquery',
	'underscore',
	'backbone',
	'views/loader/loading',
	'text!templates/schedule/generateSchedule.html'
], function($, _, Backbone, LoadingOverlay, Template) {
	var GenerateScheduleView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render', 'handleVisibility');
			this.dispatcher = options.dispatcher;

			//Events called by the search view notifying this view of its state
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
		},
		el: '#generate-schedule',
		template: _.template(Template),
		render: function() {
			this.$el.html(this.template());
			this.$message = this.$el.find('#schedule-message');
			this.loading = new LoadingOverlay({ dispatcher: this.dispatcher });

			return this;
		},
		handleVisibility: function(e, page) {
			if(page === 'generate-schedule') {
				this.$el.fadeIn();
				this.dispatcher.trigger('pager:disableBtn', 'next');
				this.dispatcher.trigger('pager:enableBtn', 'previous');
				this.dispatcher.trigger('pager:setHref', 'previous', '#availability');
				this.dispatcher.trigger('pager:setHref', 'next', '#generate-schedule');
			}
			else {
				this.$el.hide();
			}
		}
	});

	return GenerateScheduleView;
});