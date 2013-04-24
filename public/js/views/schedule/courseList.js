define([
	'jquery',
	'underscore',
	'backbone',
	'views/schedule/courseSearchItem'
], function($, _, Backbone, CourseSearchItem) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			this.$listContainer = this.$el;
			this.$list = this.$el.find('#course-list');
			this.$message = this.$el.find('#course-message');

			_.bindAll(this, 'render', 'searchError');
			//this.$pagination = new PageinationView();
			this.dispatcher = options.dispatcher;
			this.dispatcher.on('search:error', this.searchError);

			this.collection.on('add', this.render, this);
			this.collection.on('reset', this.render, this);
		},
		el: '#course-container',
		render: function() {
			if(this.collection.length > 0) {
				this.$list.html('').show();
				this.$message.hide();
				var self = this;
				this.collection.each(function(course) {

					var cv = new CourseSearchItem({ model: course });
					self.$list.append(cv.render().el);
				});
			}
			else {
				this.$list.hide();
				this.$message.html('<strong>No classes found.</strong>').show();
			}

			return this;
		},
		searchError: function(data) {
			this.$message.html('<strong>There was an error contacting the server.</strong>').show();
		}
	});

	return CourseListView;
});