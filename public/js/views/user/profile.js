define([
	'jquery',
	'underscore',
	'backbone',
	'models/user',
	'views/user/profileHeader',
	'views/loader/loading'
], function($, _, Backbone, User, ProfileHeaderView, LoadingView) {
	var ProfileView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;
			this.model = new User({ userName: this.$el.attr('id') });
			this.loading = new LoadingView({ el: '#profile-loader', dispatcher: this.dispatcher });
			this.template = _.template($('.profile').html());
			this.model.on('change', this.render, this);

			_.bindAll(this, 'render', 'fetchSuccess');
			this.fetchUser();
		},
		render: function() {
			this.profileHeader = new ProfileHeaderView({ model: this.model, dispatcher: this.dispatcher });
			this.profileHeader.setElement(this.$el.find('.profile-header')).render();

			return this;
		},
		events: {
		},
		el: '.profile',
		fetchUser: function() {
			this.dispatcher.trigger('loading:start');
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