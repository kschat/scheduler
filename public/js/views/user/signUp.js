define([
	'jquery',
	'underscore',
	'backbone',
	'router',
	'models/user'
], function($, _, Backbone, Router, User) {
	var SignupView = Backbone.View.extend({
		initialize: function(options) {
			this.router = Backbone.Router;
			this.model = options.model;
			this.$errorMessage = this.$el.find('#signup-error');

			_.bindAll(this, 'render', 'renderError', 'signupError', 'signupSuccess');
			this.render();
		},
		render: function() {
			this.$errorMessage.find('p').text('');
			this.$errorMessage.hide();
			return this;
		},
		renderError: function(err) {
			this.$errorMessage.find('p').text(err);
			this.$errorMessage.show();
			return this;
		},
		events: {
			'click #signup-btn': 'signup'
		},
		el: '#signup-form',
		signupError: function(model, xhr, options) {
			this.renderError(xhr.responseText);
			return false;
		},
		signupSuccess: function(model, response, options) {
			this.router.navigate('/about');
		},
		signup: function() {
			this.render();
			var $fields = this.$el.find(':input:not(:button)');
			var obj = {};
			$fields.each(function() {
				var field = $(this),
					fieldName = field.attr('name');
				if(fieldName) {
					obj[fieldName] = field.val();
				}
			});

			this.model.set(obj);
			this.model.save({}, {
				success: this.signupSuccess,
				error: 	this.signupError
			});
			return false;
		}
	});

	return SignupView;
});