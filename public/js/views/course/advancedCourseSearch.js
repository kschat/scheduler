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
			this.courseList = new CourseListView({ 
				collection: this.collection, 
				addable: options.addable
			});

			_.bindAll(this, 'render', 'showResults', 'search');
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
		search: function(e) {
			this.collection.fetch({
				courseNumber: this.$searchButton.val(),
				success: this.showResults
			});

			return false;
		},
		showResults: function(data) {
			var self = this;
			this.$el.find('#advanced-options').slideUp(function() {
				self.$el.find('#toggle-options').text('Show advanced options');
			});
			self.$el.find('#results').fadeIn(800);
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