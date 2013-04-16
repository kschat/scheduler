define([
	'jquery',
	'underscore',
	'backbone',
	'ajaxForm',
	'models/user',
	'text!templates/user/profile-header.html',
	'text!templates/user/profile-header-edit.html',
	'views/user/editButton'
], function($, _, Backbone, ajaxForm, User, Template, EditTemplate, EditButtonView) {
	var ProfileHeaderView = Backbone.View.extend({
		initialize: function(options) {
			this.model = options.model;
			this.editBtn = new EditButtonView();
			this.$errorMessage = this.$el.find('#message-container');

			_.bindAll(this, 'render', 'editProfile', 'updateModel', 'updateSuccess', 'updateError');
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			this.editBtn.setElement(this.$el.find('#edit-btn'));
			this.$errorMessage = this.$el.find('#message-container');
			$('#image-upload-form').ajaxForm();
			
			return this;
		},
		events: {
			'click #edit-btn': 			'editProfile',
			'click #image-upload-btn': 	'uploadImage'
		},
		el: '.profile-header',
		template: _.template(Template),
		editProfile: function(e) {
			e.preventDefault();
			if($('.profile-header').data('edit')) {
				this.updateModel($('#update-profile').children(':input'));
				this.model.save({}, {
					success: this.updateSuccess,
					error: this.updateError
				});
			}
			else {
				this.template = _.template(EditTemplate);
				$('.profile-header').data('edit', true);
				this.render();
			}
		},
		uploadImage: function() {
			$('#image-upload-form').ajaxSubmit();
		},
		updateModel: function($element) {
			var obj = "{",
				objInst = {};

			$element.each(function(index) {
				console.log($(this).attr('name'));
				if(typeof $(this).attr('name') !== 'undefined') {
					var value = $('[name="' + $(this).attr('name') + '"]').val();
					obj += "\"" + $(this).attr('name') + "\":\"" + value + "\",";
				}
			});
			obj = obj.substring(0, obj.length-1) + "}";
			console.log(obj);
			objInst = JSON.parse(obj);
			
			this.model.set(objInst);
		},
		updateSuccess: function() {
			this.template = _.template(Template);
			$('.profile-header').data('edit', false);
			this.render();
			this.showMessage('Profile updated.');
		},
		updateError: function() {
			this.editBtn.editError();
			this.showErrorMessage('Error saving to the server.');
		},
		showMessage: function(message) {
			this.$errorMessage.children('#message')
				.removeClass('alert-error')
				.addClass('alert-success')
				.children('#message-text')
				.text(message);

			this.$errorMessage.fadeIn(700);
		},
		showErrorMessage: function(message) {
			this.$errorMessage.children('#message')
				.removeClass('alert-success')
				.addClass('alert-error')
				.children('#message-text')
				.text(message);

			this.$errorMessage.fadeIn(700);
		}
	});

	return ProfileHeaderView;
});