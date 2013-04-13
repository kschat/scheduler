define([
	'jquery',
	'underscore',
	'backbone',
	'models/course',
	'views/course/courseList',
	'views/pagination/pagination',
	'collections/courseCollection',
	'text!templates/course/advancedSearch.html'
], function($, _, Backbone, Course, CourseListView, PaginationView, CourseCollection, SearchTemplate) {
	var AdvancedSearchView = Backbone.View.extend({
		initialize: function(options) {
			this.template = _.template(SearchTemplate);
			this.addable = options.addable;
			this.dispatcher = options.dispatcher;
			this.$searchButton = this.$el.find('#advanced-course-text');

			_.bindAll(this, 'render', 'showResults', 'search', 'updateList');

			this.dispatcher.on('updatePage', this.updateList);
			this.dispatcher.on('course:search', this.render);					//Event triggered when the search course page is requested
			//this.dispatcher.on('course:render:complete', this.showResults);	//Event triggered when the course list is done rendering
			this.dispatcher.on('pagination:page', this.updateList); 			//Event triggered when a search is submitted
		},
		render: function() {
			if(this.$el.find('#advanced-options').length === 0) {
				this.$el.prepend(this.template());
			}
			else {
				//this.hideResults();
			}
			this.$searchButton = this.$el.find('#advanced-course-text');
			return this;
		},
		events: {
			'click #advanced-course-submit': 'search',
			'click #toggle-options': 'toggleOptions'
		},
		el: '#advanced-search',
		search: function(e) {
			e.preventDefault();
			this.dispatcher.trigger('url:update', 'courses/search/' + this.$searchButton.val() + '/page/1');
			this.dispatcher.trigger('course:search:submit', 'course', 'courseNumber=' + this.$searchButton.val());
		},
		showResults: function() {
			var self = this;
			this.$el.find('#advanced-options').slideUp(function() {
				self.$el.find('#toggle-options').text('Show advanced options');
			});
			self.$el.find('#results').fadeIn(800);
		},
		hideResults: function() {
			var self = this;
			self.$el.find('#results').fadeOut(800);
			this.$el.find('#advanced-options').slideDown(function() {
				self.$el.find('#toggle-options').text('Show advanced options');
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
		updateList: function(skip, limit) {
			console.log('update');
			this.collection.fetch({
				skip: skip, 
				limit: limit,
				courseNumber: this.$searchButton.val(),
				success: this.showResults
			});
		}
	});

	return AdvancedSearchView;
});