define([
	'jquery',
	'underscore',
	'backbone',
	'views/course/courseListItem',
	'text!templates/course/courseList.html',
], function($, _, Backbone, CourseListItemView, Template) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			this.collection.on('add', this.render, this);
			this.collection.on('reset', this.render, this);

			this.collection.fetch({
				success: function(res) {
					console.log('success');
				},
				error: function(res) {
					console.log('error');
				}
			});
			_.bindAll(this, 'render');
		},
		template: _.template(Template),
		render: function() {
			this.$el.html(this.template());
			var self = this;
			this.collection.each(function(course) {
				console.log(course);
				var cv = new CourseListItemView({ model: course });
				self.$el.append(cv.render().el);
			});

			return this;
		},
		events: {
		},
		el: '#course-table',
	});

	return CourseListView;
});