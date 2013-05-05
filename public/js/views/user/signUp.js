define([
	'jquery',
	'underscore',
	'backbone',
	'router',
	'models/user'
], function($, _, Backbone, Router, User) {
	var SignupView = Backbone.View.extend({
		initialize: function(options) {
			this.model = options.model;
			this.$errorMessage = this.$el.find('#signup-error');

			_.bindAll(this, 'render', 'renderError', 'signupError', 'signupSuccess');
			var self = this;
			this.model.on('invalid', function(model, error) {
				self.renderError(error.message);
				self.$el.find(error.selector).focus();
				self.$el.find(error.selector).parent().addClass('input-error');
			});

			this.render();
		},
		render: function() {
			this.$el.find('.input-state').removeClass('input-error');
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
			this.renderError(model.responseText);
			return false;
		},
		signupSuccess: function(model, response, options) {
			window.location.href = '/logincheck?email=' + this.model.get('email') + '&password=' + this.model.get('password');
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
			obj.avatar = [];
			obj.avatar[0] = { 
				filename: 'defaultProfile.jpg'
			};
			obj.passwordRepeat = this.$el.find('#passwordRepeat').val();
			var bKey = this.$el.find('#betaKey').val();
			var self = this;

			//Beta key check
			$.ajax({
				type: 'POST',
				url: '/signup/auth',
				data: {
					betaKey: bKey
				}
			}).done(function() {
				self.model.set(obj, {silent: true});
				self.model.save({}, {
					success: self.signupSuccess,
					error: 	self.signupError
				});
			}).error(this.signupError);

			return false;
		}
	});

	return SignupView;
});