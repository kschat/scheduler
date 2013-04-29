define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/courseSearch.html'
], function($, _, Backbone, Template) {
	var CourseSearchView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;

			_.bindAll(this, 'render', 'search', 'searchSuccess', 'searchError', 'handleVisibility');
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
		},
		el: '#schedule-course-search',
		template: _.template(Template),
		events: {
			'click #course-search-submit': 'search'
		},
		render: function() {
			this.$el.html(this.template());
			this.$searchText = this.$el.find('#course-search-text');

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
		handleVisibility: function(e) {
			if(e.target.hash === '#add-classes') {
				this.$el.fadeIn();
			}
			else {
				this.$el.hide();
			}
		}
	});

	return CourseSearchView;
});