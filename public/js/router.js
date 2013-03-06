define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/signUp',
	'views/user/signIn',
	'models/user'
], function($, _, Backbone, SignupView, SigninView, User) {
	var AppRouter = Backbone.Router.extend({
		routes: {
			'login': 	'loginView',
			'signup': 	'signup',
			'home': 	'default',
			'': 		'default'
		}
	});

	var initialize = function() {
		var appRouter = new AppRouter;

		appRouter.on('route:default', function() {
			var user = new User(),
				signupView = new SignupView({ model: user }),
				signinView = new SigninView({ model: user });
		});

		appRouter.on('route:loginView', function() {
			var user = new User(),
				signinView = new SigninView({ el: '#signin-page-form', model: user });
		});

		appRouter.on('route:signup', function() {
			var user = new User(),
				signupView = new SignupView({ el: '#signup-page-form', model: user });
		});

		Backbone.history.start({pushState: true});
	}

	return {
		initialize: initialize
	};
});