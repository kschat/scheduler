define([
	'jquery',
	'underscore',
	'backbone',
	'models/course',
	'views/course/courseList',
	'collections/courseCollection',
], function($, _, Backbone, Course, CourseListView, CourseCollection) {
	var AdvancedSearchView = Backbone.View.extend({
		initialize: function(options) {
			this.$searchButton = this.$el.find('#advanced-course-text');
			this.courseList = new CourseListView({ collection: this.collection });
			_.bindAll(this, 'render', 'ajaxDone');
			this.render();
		},
		render: function() {
			return this;
		},
		events: {
			'click #advanced-course-submit': 'search',
			'click #toggle-options': 'toggleOptions'
		},
		el: '#advanced-search',
		search: function() {
			$.ajax({
				url: '/api/course?courseNumber=' + this.$searchButton.val(),
				type: 'GET'
			}).done(this.ajaxDone);
			return false;
		},
		ajaxDone: function(data) {
			this.collection.reset(data);
			var self = this;
			this.$el.find('#advanced-options').slideUp(function() {
				self.$el.find('#toggle-options').text('Show advanced options');
				self.$el.find('#results').fadeIn(800);
			});
		},
		toggleOptions: function() {
			var self = this;
			this.$el.find('#advanced-options').slideToggle(function() {
				if($(this).is(':hidden')) {
					self.$el.find('#toggle-options').text('Show advanced options');
				}
				else {
					self.$el.find('#toggle-options').text('Hide advanced options');
				}
			});

			return false;
		},
	});

	return AdvancedSearchView;
});