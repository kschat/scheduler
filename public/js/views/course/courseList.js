define([
	'jquery',
	'underscore',
	'backbone',
	'views/course/courseListItem',
	'text!templates/course/courseList.html',
	'text!templates/course/courseAddList.html',
], function($, _, Backbone, CourseListItemView, Template, AddTemplate) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			this.$table = this.$el.find('#course-table');
			this.$errorMessage = this.$el.find('#courses-error');
			this.template = options.addable ? _.template(AddTemplate) : _.template(Template);
			this.addable = options.addable;

			this.collection.on('add', this.render, this);
			this.collection.on('reset', this.render, this);

			_.bindAll(this, 'render', 'fetchClasses');
		},
		render: function() {
			if(this.collection.length > 0) {
				this.$table.html(this.template()).show();
				this.$errorMessage.hide();
				var self = this;
				this.collection.each(function(course) {
					var cv = new CourseListItemView({ model: course, addable: self.addable });
					self.$table.append(cv.render().el);
				});
			}
			else {
				this.$table.hide();
				this.$errorMessage.html('<strong>No classes found.</strong>').show();
			}

			return this;
		},
		el: '#courses',
		fetchClasses: function() {
			this.collection.fetch({
				success: function(res) {
				},
				error: function(res) {
				}
			});
		}
	});

	return CourseListView;
});