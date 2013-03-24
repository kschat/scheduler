define([
	'jquery',
	'underscore',
	'backbone',
	'models/user',
	'views/user/profileHeader'
], function($, _, Backbone, User, ProfileHeaderView) {
	var ProfileView = Backbone.View.extend({
		initialize: function(options) {
			this.model = new User({ userName: this.$el.attr('id') });
			this.profileHeader = new ProfileHeaderView({ model: this.model });
			this.template = _.template($('.profile').html());
			this.model.on('change', this.render, this);

			_.bindAll(this, 'render', 'fetchSuccess');
			this.fetchUser();
		},
		render: function() {
			this.$el.html(this.template());
			this.profileHeader.setElement(this.$el.find('.profile-header')).render();

			return this;
		},
		events: {
		},
		el: '.profile',
		fetchUser: function() {
			this.model.fetch({
				success: this.fetchSuccess,
				error: function(res) {
					console.log(res);
				}
			});
		},
		fetchSuccess: function(res) {
			//console.log(res);
		}
	});

	return ProfileView;
});