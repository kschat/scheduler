define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/availabilityChooser.html'
], function($, _, Backbone, Template) {
	var AvailabilityChooserView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;

			_.bindAll(this, 'render', 'handleVisibility');
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
		},
		el: '#availability-view',
		template: _.template(Template),
		events: {
			
		},
		render: function() {
			this.$el.html(this.template());

			return this;
		},
		handleVisibility: function(e) {
			if(e.target.hash === '#availability') {
				this.$el.fadeIn();
				this.dispatcher.trigger('pager:enableBtn', 'previous');
			}
			else {
				this.$el.hide();
			}
		}
	});

	return AvailabilityChooserView;
});