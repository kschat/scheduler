define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/signUp',
	'views/user/signIn',
	'models/user'
], function($, _, Backbone, SignupView, SignInView, User) {
	var AppRouter = Backbone.Router.extend({
		routes: {
			'': 'default'
		}
	});

	var initialize = function() {
		var appRouter = new AppRouter;

		appRouter.on('route:default', function(page) {
			var user = new User(),
				signupView = new SignupView({ model: user}),
				signupView = new SignInView({ model: user});
		});

		Backbone.history.start();
	}

	return {
		initialize: initialize
	};
});