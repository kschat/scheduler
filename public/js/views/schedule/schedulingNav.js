define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/schedulingNav.html'
], function($, _, Backbone, Template) {
	var ScheduleNav = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;
			_.bindAll(this, 'render', 'buttonClicked', 'enableButton', 'disableButton', 'setButtonHref');

			//Various events that can be called by other views to manipuate this or other views
			this.dispatcher.on('pager:disableBtn', this.disableButton);
			this.dispatcher.on('pager:enableBtn', this.enableButton);
			this.dispatcher.on('pager:setHref', this.setButtonHref);
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

			//Only sends a broadcast if the button is not disabled
			if(!$(e.target).parent().hasClass('disabled')) {
				this.dispatcher.trigger('pager:btnClicked', e, e.target.hash.substring(1));
			}
		},
		enableButton: function(btn) {
			this.$el.children('li.' + btn).removeClass('disabled');
		},
		disableButton: function(btn) {
			this.$el.children('li.' + btn).addClass('disabled');
		},
		setButtonHref: function(btn, hash) {
			this.$el.children('li.' + btn).children('a').attr('href', hash);
		} 
	});

	return ScheduleNav;
});