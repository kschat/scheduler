define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/schedulingNav.html'
], function($, _, Backbone, Template) {
	var ScheduleNav = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;
			_.bindAll(this, 'render', 'buttonClicked', 'enableButton', 'disableButton');

			//Various events that can be called by other views to manipuate this or other views
			this.dispatcher.on('pager:disableBtn', this.disableButton);
			this.dispatcher.on('pager:enableBtn', this.enableButton);
		},
		tagName: 'ul',
		className: 'pager',
		el: '.pager',
		template: _.template(Template),
		render: function() {
			this.$el.html(this.template());

			return this;
		},
		events: {
			'click > li > a': 'buttonClicked'
		},
		buttonClicked: function(e) {
			e.preventDefault();
			this.dispatcher.trigger('pager:btnClicked', e);
		},
		enableButton: function(btn) {
			this.$el.children('li.' + btn).removeClass('disabled');
		},
		disableButton: function(btn) {
			this.$el.children('li.' + btn).addClass('disabled');
		}
	});

	return ScheduleNav;
});