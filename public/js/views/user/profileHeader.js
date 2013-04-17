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
			this.previewImage = {};

			_.bindAll(this, 'render', 'editProfile', 'updateModel', 'updateSuccess', 'updateError');
		},
		render: function() {
			console.log(this.model.attributes);
			
			//Temp hack to sync the server and client models since mongoose doesn't allow for a single embedded schema
			//if(this.model.attributes.avatar[0]) { this.model.set('avatar', this.model.get('avatar')[0]);}

			this.$el.html(this.template(this.model.attributes));
			this.editBtn.setElement(this.$el.find('#edit-btn'));
			this.$errorMessage = this.$el.find('#message-container');
			//$('#image-upload-form').ajaxForm();
			
			return this;
		},
		events: {
			'click #edit-btn': 			'editProfile',
			'click #image-upload-btn': 	'uploadImage',
			'change #image-file': 		'readFile'
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
		readFile: function(e) {
			var file = e.target.files[0], 
				reader = new FileReader();

			if(!file.type.match('image.*')) {
				console.log('not an image');
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
					self.$el.find('#preview').attr('src', e.target.result);
					self.$el.find('#image-upload-btn').removeAttr('disabled');
				};
			})(file, this);

			reader.readAsDataURL(file);

			return true;
		},
		uploadImage: function(e) {
			this.model.set(this.previewImage, {silent: true});
			//Update the current picture on the users profile
			this.$el.find('#profile-image').attr('src', this.model.attributes.avatar[0].data);
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
		generateUniqueName: function(fileName) {
			return new Date().getTime() + '-' + fileName;
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