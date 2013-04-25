define([
	'jquery',
	'underscore',
	'backbone',
	'views/schedule/courseSearchItem',
	'views/loader/loading'
], function($, _, Backbone, CourseSearchItem, LoadingOverlay) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			this.$listContainer = this.$el;
			this.$list = this.$el.find('#course-list');
			this.$message = this.$el.find('#course-message');
			this.loading = new LoadingOverlay({ dispatcher: options.dispatcher });

			_.bindAll(this, 'render', 'searchError', 'searchSuccess');
			this.dispatcher = options.dispatcher;

			//Events called by the search view notifying this view of its state
			this.dispatcher.on('search:error', this.searchError);
			this.dispatcher.on('search:success', this.searchSuccess);

			this.collection.on('add', this.render, this);
			this.collection.on('reset', this.render, this);
		},
		el: '#course-container',
		render: function() {
			if(this.collection.length > 0) {
				this.$list.html('');
				this.$message.hide();
				var self = this;
				this.collection.each(function(course) {

					var cv = new CourseSearchItem({ model: course });
					self.$list.append(cv.render().el);
				});

				this.$list.fadeIn(700);
			}
			else {
				this.$list.hide();
				this.$message.html('<strong>No classes found.</strong>').show();
			}

			return this;
		},
		searchSuccess: function(data) {
			this.dispatcher.trigger('loading:done');
		},
		searchError: function(data) {
			this.dispatcher.trigger('loading:stop');
			this.$message.html('<strong>There was an error contacting the server.</strong>').show();
		}
	});

	return CourseListView;
});