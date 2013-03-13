define([
	'jquery',
	'underscore',
	'backbone',
	'views/course/courseListItem',
	'text!templates/course/courseList.html',
], function($, _, Backbone, CourseListItemView, Template) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			this.$table = this.$el.find('#course-table');
			this.$errorMessage = this.$el.find('#courses-error');

			this.collection.on('add', this.render, this);
			this.collection.on('reset', this.render, this);

			_.bindAll(this, 'render', 'fetchClasses');
		},
		template: _.template(Template),
		render: function() {
			if(this.collection.length > 0) {
				this.$table.html(this.template()).show();
				this.$errorMessage.hide();
				var self = this;
				this.collection.each(function(course) {
					var cv = new CourseListItemView({ model: course });
					self.$table.append(cv.render().el);
				});
			}
			else {
				this.$table.hide();
				this.$errorMessage.html('<strong>No classes found.</strong>').show();
			}

			return this;
		},
		events: {
		},
		el: '#courses',
		fetchClasses: function() {
			console.log(this.collection);
			this.collection.fetch({
				success: function(res) {
					console.log('success');
				},
				error: function(res) {
					console.log('error');
				}
			});
		}
	});

	return CourseListView;
});