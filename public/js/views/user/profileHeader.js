define([
	'jquery',
	'underscore',
	'backbone',
	'models/user',
	'text!templates/user/profile-header.html',
	'text!templates/user/profile-header-edit.html',
	'views/user/editButton'
], function($, _, Backbone, User, Template, EditTemplate, EditButtonView) {
	var ProfileHeaderView = Backbone.View.extend({
		initialize: function(options) {
			if(this.$el.data('editable')) {
				this.editBtn = new EditButtonView();
				console.log('edit');
			}

			this.model = this.options.model;
			this.dispatcher = this.options.dispatcher;
			this.previewImage = {};

			_.bindAll(this, 'render', 'editProfile', 'updateModel', 'updateSuccess', 'updateError');
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			if(this.editBtn) {
				this.editBtn.setElement(this.$el.find('#edit-btn'));
				this.$el.find('#edit-btn').show();
			}
			this.$errorMessage = this.$el.find('#message-container');
			this.$uploadModal = this.$el.find('#upload-modal');
			this.$uploadMessage = this.$uploadModal.find('#upload-message');
			this.dispatcher.trigger('loading:done');
			return this;
		},
		events: {
			'click #edit-btn': 			'editProfile',
			'click #image-upload-btn': 	'saveImage',
			'change #image-file': 		'readFile'
		},
		el: '.profile-header',
		template: _.template(Template),
		editProfile: function(e) {
			e.preventDefault();
			this.dispatcher.trigger('loading:start');
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
		readFile: function(e) {
			this.$uploadMessage.hide();

			var file = e.target.files[0], 
				reader = new FileReader();

			if(!file.type.match('image.*')) {
				this.$uploadMessage.text('File not an image.').fadeIn(700);
				this.$uploadModal.find('#image-upload-btn').attr('disabled', 'disabled');
				return false;
			}

			reader.onload = (function(theFile, self) {
				return function(e) {
					var imgObj = {
						avatar: [{ 
							filename: self.generateUniqueName(theFile.name),
							data: e.target.result
						}]
					};

					self.previewImage = imgObj;
					self.$uploadModal.find('#preview').attr('src', e.target.result);
					self.$uploadModal.find('#image-upload-btn').removeAttr('disabled');
				};
			})(file, this);

			reader.readAsDataURL(file);

			return true;
		},
		saveImage: function(e) {
			this.model.set(this.previewImage, {silent: true});
			//Update the current picture on the users profile
			this.$el.find('#profile-image').attr('src', this.model.attributes.avatar[0].data);
		},
		updateModel: function($element) {
			var obj = "{",
				objInst = {};

			$element.each(function(index) {
				if(typeof $(this).attr('name') !== 'undefined') {
					var value = $('[name="' + $(this).attr('name') + '"]').val();
					obj += "\"" + $(this).attr('name') + "\":\"" + value + "\",";
				}
			});

			obj = obj.substring(0, obj.length-1) + "}";
			objInst = JSON.parse(obj);
			
			this.model.set(objInst);
		},
		generateUniqueName: function(fileName) {
			return new Date().getTime() + '-' + fileName;
		},
		updateSuccess: function() {
			this.dispatcher.trigger('loading:done');
			this.template = _.template(Template);
			$('.profile-header').data('edit', false);
			this.render();
			this.showMessage('Profile updated.');
		},
		updateError: function() {
			this.dispatcher.trigger('loading:stop');
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