define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/signUp',
	'views/user/signIn',
	'views/user/profile',
	'views/course/search',
	'views/course/courseList',
	'views/course/advancedCourseSearch',
	'views/pagination/pagination',
	'models/user',
	'collections/courseCollection'
], function($, _, Backbone, SignupView, SigninView, ProfileView, SearchView, CourseListView, 
		AdvancedSearchView, PaginationView, User, CourseCollection) {
	var AppRouter = Backbone.Router.extend({
		routes: {
			'login': 							'loginView',
			'signup': 							'signup',
			'home': 							'default',
			'user/:profile': 					'profile',
			'courses/': 						'courses',
			'courses': 							'courses',
			'courses/search': 					'courseSearch',
			'courses/search/': 					'courseSearch',
			'courses/search/:filter':			'courseSearch',
			'courses/search/:filter/page/:p': 	'courseSearchPage',
			'schedule/create': 					'scheduleCreate',
			'': 								'default'
		}
	});

	var initialize = function() {
		var appRouter = new AppRouter,
			dispatcher = _.clone(Backbone.Events),
			courseCollection = new CourseCollection(),
			pagination = new PaginationView({
				dispatcher: dispatcher, 
				contentModel: '',
				modelBaseUrl: ''
			}),
			advancedSearchView = new AdvancedSearchView({
				dispatcher: dispatcher,
				collection: courseCollection,
				addable: false
			}),
			courseList = new CourseListView({
				dispatcher: dispatcher,
				collection: courseCollection, 
				addable: false
			});

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
			var user = new User(),
				searchView = new SearchView(),
				profileView = new ProfileView({ model: user });
		});

		appRouter.on('route:courses', function() {
			var searchView = new SearchView(),
				courseListView = new CourseListView({ collection: new CourseCollection() });

			courseListView.fetchClasses();
		});

		appRouter.on('route:courseSearch', function(filter) {
			dispatcher.trigger('course:search');
			dispatcher.trigger('pagination:baseurl', 'courses/search/' + filter);
			
			if(filter) {
				dispatcher.trigger('course:search:submit', 'course', 'courseNumber=' + filter);
			}
		});

		appRouter.on('route:courseSearchPage', function(filter, page) {
			page = page ? page : 1;
			dispatcher.trigger('course:search');
			dispatcher.trigger('pagination:baseurl', 'courses/search/' + filter);
			dispatcher.trigger('pagination:pageupdate', page, filter);

			if(filter) {
				filter = filter === 'all' ? '' : filter;
				dispatcher.trigger('course:search:submit', 'course', 'courseNumber=' + filter);
			}
		});

		appRouter.on('route:scheduleCreate', function() {
			var courseCollection = new CourseCollection(),
				advancedSearchView = new AdvancedSearchView({ 
					collection: courseCollection,
					addable: true 
				 });
		});

		Backbone.history.start({pushState: true});

		dispatcher.on('url:update', function(url) {
			appRouter.navigate(url, true);
		});

		//Enables pushState for all links that don't contain the "data-bypass" attribute
		$(document).on('click', 'a:not([data-bypass])', function (evt) {

			var href = $(this).attr('href');
			var protocol = this.protocol + '//';

			if (href.slice(protocol.length) !== protocol) {
				evt.preventDefault();
				appRouter.navigate(href, true);
			}
		});

	}

	return {
		initialize: initialize
	};
});