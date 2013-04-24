define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	var CourseSearchView = Backbone.View.extend({
		initialize: function(options) {
			this.$searchText = this.$el.find('#course-search-text');
			//this.$pagination = new PageinationView();
			this.dispatcher = options.dispatcher;

			_.bindAll(this, 'render', 'search', 'searchError');
		},
		events: {
			'click #course-search-submit': 'search'
		},
		render: function() {

			return this;
		},
		search: function(e) {
			e.preventDefault();
			this.collection.fetch({ 
				courseNumber: this.$searchText.val(), 
				dontPage: true,
				error: this.searchError
			});
		},
		searchError: function(data) {
			this.dispatcher.trigger('search:error', data);
		},
		el: '#course-search'
	});

	return CourseSearchView;
});