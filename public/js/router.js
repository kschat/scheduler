/**
 * Digging my grave by being lazy and not refactoring...
 * alas, didn't realize this until a week before the due date.
 */

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
	'views/schedule/courseList',
	'views/schedule/courseSearch',
	'views/schedule/schedulingNav',
	'views/schedule/availabilityChooser',
	'views/schedule/generateSchedule',
	'views/pagination/pagination',
	'models/user',
	'collections/courseCollection'
], function($, _, Backbone, SignupView, SigninView, ProfileView, SearchView, CourseListView, 
		AdvancedSearchView, ScheduleCourseListView, ScheduleCourseSearchView, ScheduleNav, 
		AvailabilityChooserView, GenerateScheduleView, PaginationView, User, CourseCollection) {
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
			'courses/:course': 					'coursePage',
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

		appRouter.on('route:coursePage', function() {
			var searchView = new SearchView();
		});

		appRouter.on('route:scheduleCreate', function() {

			var searchView = new SearchView(),
				courses = new CourseCollection(),
				selectedCourses = new CourseCollection(),
				scheduleCourseSearchView = new ScheduleCourseSearchView({ 
					collection: courses,
					dispatcher: dispatcher
				}),
				scheduleCourseListView = new ScheduleCourseListView({ 
					collection: courses, 
					selectedCourses: selectedCourses,
					dispatcher: dispatcher
				}),
				scheduleNav = new ScheduleNav({
					dispatcher: dispatcher
				}),
				availabilityChooserView = new AvailabilityChooserView({
					dispatcher: dispatcher
				}),
				generateScheduleView = new GenerateScheduleView({
					dispatcher: dispatcher,
					collection: selectedCourses
				});

			scheduleCourseListView.render();
			scheduleCourseSearchView.render();
			availabilityChooserView.render();
			generateScheduleView.render();
			scheduleNav.render();

			//Disables the previous button on page load
			dispatcher.trigger('pager:disableBtn', 'previous');
			dispatcher.trigger('pager:disableBtn', 'next');
		});

		Backbone.history.start({pushState: true});

		dispatcher.on('url:update', function(url) {
			appRouter.navigate(url, true);
		});

		//Enables pushState for all links that contain the "data-bypass" attribute
		$(document).on('click', 'a[data-bypass]', function (evt) {

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