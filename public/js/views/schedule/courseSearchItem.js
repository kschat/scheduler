define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/courseItem.html'
], function($, _, Backbone, Template) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render');
		},
		tagName: 'li',
		template: _.template(Template),
		render: function() {
			this.$el.html(this.template(this.model.attributes));

			return this;
		}
	});

	return CourseListView;
});