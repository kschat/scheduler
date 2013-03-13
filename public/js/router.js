define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/signUp',
	'views/user/signIn',
	'views/course/search',
	'views/course/courseList',
	'views/course/advancedCourseSearch',
	'models/user',
	'collections/courseCollection'
], function($, _, Backbone, SignupView, SigninView, SearchView, CourseListView, 
		AdvancedSearchView, User, CourseCollection) {
	var AppRouter = Backbone.Router.extend({
		routes: {
			'login': 			'loginView',
			'signup': 			'signup',
			'home': 			'default',
			'user/:profile': 	'profile',
			'courses': 			'courses',
			'courses/search': 	'courseSearch',
			'': 				'default'
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

		appRouter.on('route:profile', function() {
			var searchView = new SearchView();
		});

		appRouter.on('route:courses', function() {
			var searchView = new SearchView(),
				courseListView = new CourseListView({ collection: new CourseCollection() });

			courseListView.fetchClasses();
		});

		appRouter.on('route:courseSearch', function() {
			var courseCollection = new CourseCollection(),
				advancedSearchView = new AdvancedSearchView({ collection: courseCollection });
		});

		Backbone.history.start({pushState: true});
	}

	return {
		initialize: initialize
	};
});