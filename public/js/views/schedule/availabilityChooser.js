define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/availabilityChooser.html',
	'text!templates/schedule/calendarPopup.html'
], function($, _, Backbone, Template, PopupTemplate) {
	var AvailabilityChooserView = Backbone.View.extend({
		initialize: function(options) {
			this.$selectedTime = null;
			this.dispatcher = options.dispatcher;

			this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

			_.bindAll(this, 'render', 'handleVisibility');
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
		},
		el: '#availability-view',
		template: _.template(Template),
		events: {
			'click #calendar .time-split': 'displayPopup'
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
							return days[$(this).data('day')];
						}
					})(self.days),
					//more closure swag
					content: (function(template) {
						return function() {
							return template({ startTime: $(this).data('time') });
						}
					})(popupTemp)
				});
			});

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
		},
		displayPopup: function(e) {
			//Saftey check to determine if there were any selected elements before this one
			this.$selectedTime = this.$selectedTime || $(e.target);

			this.$selectedTime.removeClass('selected-time').popover('hide');

			//Sets the selected element to the element that was just clicked.
			this.$selectedTime = $(e.target);

			this.$selectedTime.addClass('selected-time').popover('show');
		}
	});

	return AvailabilityChooserView;
});