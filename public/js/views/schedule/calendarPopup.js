define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/calendarPopup.html'
], function($, _, Backbone, Template) {
	var CalendarPopupView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;
			this.selectedPopup = null;
			this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			_.bindAll(this, 'render');
		},
		template: _.template(Template),
		events: {
			'click': 'test'
		},
		test: function() {console.log('t');},
		render: function() {
			console.log(this.$el);
			this.$el.popover({ 
					trigger: 'manual',
					placement: 'top',
					html: true,
					//closure swag
					title: (function(days) {
						return function() {
							return days[$(this).data('day')];
						}
					})(self.days),
					//more closure swag
					content: (function(template) {
						return function() {
							return template({ startTime: $(this).data('time') });
						}
					})(this.template)
				});
			return this;
		},

	});

	return CalendarPopupView;
});