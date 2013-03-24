define([
	'jquery',
	'underscore',
	'backbone',
	'models/user',
	'text!templates/user/profile-header.html',
	'text!templates/user/profile-header-edit.html',
	'views/user/editButton',
], function($, _, Backbone, User, Template, EditTemplate, EditButtonView) {
	var ProfileHeaderView = Backbone.View.extend({
		initialize: function(options) {
			this.model = options.model;
			this.editBtn = new EditButtonView();

			_.bindAll(this, 'render', 'editProfile', 'addFriend', 'updateModel');
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			this.editBtn.setElement(this.$el.find('#edit-btn'));
			return this;
		},
		events: {
			'click #add-friend-btn': 'addFriend',
			'click #edit-btn': 	'editProfile'
		},
		el: '.profile-header',
		template: _.template(Template),
		editProfile: function(e) {
			e.preventDefault();
			if($('.profile-header').data('edit')) {
				this.updateModel($(':input'));
				this.model.save({
					success: function(res) {
						console.log(res);
					},
					error: 	function(res) {
						console.log(res);
					}
				});
				this.template = _.template(Template);
				$('.profile-header').data('edit', false);
			}
			else {
				this.template = _.template(EditTemplate);
				$('.profile-header').data('edit', true);
			}
			this.render();
		},
		addFriend: function() {

		},
		updateModel: function($element) {
			var obj = "{",
				objInst = {};

			$element.each(function(index) {
				if($(this).attr('name') === 'fullName') {
					var cachedName = $('[name="' + $(this).attr('name') + '"]').val(),
						fName = cachedName.split(' ')[0],
						lName = cachedName.split(' ')[1];

					obj += "\"firstName\":\"" + fName + "\", \"lastName\":\"" + lName + "\",";	
				}
				else {
					var value = $('[name="' + $(this).attr('name') + '"]').val();
					obj += "\"" + $(this).attr('name') + "\":\"" + value + "\",";
				}
			});
			obj = obj.substring(0, obj.length-1) + "}";
			console.log(obj);
			objInst = JSON.parse(obj);
			
			this.model.set(objInst);
		}
	});

	return ProfileHeaderView;
});