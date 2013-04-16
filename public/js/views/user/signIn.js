define([
	'jquery',
	'underscore',
	'backbone',
	'router',
	'models/user'
], function($, _, Backbone, Router, User) {
	var SigninView = Backbone.View.extend({
		initialize: function(options) {
			this.router = Backbone.Router.extend();
			this.model = options.model;
			this.$errorMessage = this.$el.find('#signin-error');

			_.bindAll(this, 'render', 'renderError', 'ajaxDone');
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
			'click #signin-btn': 'signin'
		},
		el: '#signin-form',
		ajaxDone: function(data) {
			if(data.error) {
				console.log(this);
				this.renderError(data.message);
				return;
			}

			window.location = '/user/' + data.user.userName;
		},
		signin: function() {
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

			$.ajax({
				url: '/login',
				type: 'POST',
				data: obj,

			}).done(this.ajaxDone);

			return false;
		}
	});

	return SigninView;
});