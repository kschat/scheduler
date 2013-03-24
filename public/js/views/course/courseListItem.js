define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/course/courseListItem.html',
	'text!templates/course/courseAddListItem.html',
], function($, _, Backbone, Template, AddTemplate) {
	var CourseListItemView = Backbone.View.extend({
		initialize: function(options) {
			this.template = options.addable ? _.template(AddTemplate) : _.template(Template);
			this.model.on('change', this.render, this);
			_.bindAll(this, 'render');
		},
		tagName: 'tr',
		render: function() {
			this.$el.html(this.template(this.model.attributes));

			return this;
		},
	});

	return CourseListItemView;
});