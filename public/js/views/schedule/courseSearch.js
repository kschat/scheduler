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

			_.bindAll(this, 'render', 'search', 'searchSuccess', 'searchError');
		},
		events: {
			'click #course-search-submit': 'search'
		},
		render: function() {

			return this;
		},
		search: function(e) {
			e.preventDefault();
			this.dispatcher.trigger('loading:start');

			this.collection.fetch({ 
				courseNumber: this.$searchText.val(), 
				dontPage: true,
				success: this.searchSuccess,
				error: this.searchError
			});
		},
		searchSuccess: function(data) {
			this.dispatcher.trigger('search:success', data);
		},
		searchError: function(data) {
			this.dispatcher.trigger('search:error', data);
		},
		el: '#course-search'
	});

	return CourseSearchView;
});