define([
	'jquery',
	'underscore',
	'backbone',
	'models/user'
], function($, _, Backbone, User) {
	var EditButtonView = Backbone.View.extend({
		initialize: function(options) {
			this.setElement(this.el);

			_.bindAll(this, 'render', 'editProfile', 'editError');
		},
		render: function() {
			if(this.$el.data('toggle')) {
				this.$el.text('Done').addClass('btn-flat-inv');
			}
			else {
				this.$el.text('Edit profile').removeClass('btn-flat-inv');
			}
			return this;
		},
		events: {
			'click': 	'editProfile'
		},
		el: '#edit-btn',
		tagName: 'a',
		editProfile: function(e) {
			e.preventDefault();
			var toggle = this.$el.data('toggle') ? false : true;
			this.$el.data('toggle', toggle);
			
			this.render();
		},
		editError: function() {
			console.log('err');
			this.$el.data('toggle', true);
			this.render();

			return false;
		}
	});

	return EditButtonView;
});