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
			'login': 	'loginView',
			'signup': 	'signup',
			'': 	'default'
		}
	});

	var initialize = function() {
		var appRouter = new AppRouter;

		appRouter.on('route:default', function() {
			console.log('default');
			var user = new User(),
				signupView = new SignupView({ model: user}),
				signinView = new SignInView({ model: user});
		});

		appRouter.on('route:loginView', function() {
			console.log('login');
			var user = new User(),
				signinView = new SignInView({ model: user});
		});

		appRouter.on('route:signup', function() {
			var user = new User(),
				signupView = new SignupView({ model: user});
		});

		Backbone.history.start({pushState: true});
	}

	return {
		initialize: initialize
	};
});