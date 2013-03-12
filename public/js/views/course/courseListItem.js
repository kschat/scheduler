define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/course/courseListItem.html',
], function($, _, Backbone, Template) {
	var CourseListItemView = Backbone.View.extend({
		initialize: function(options) {
			this.model.on('change', this.render, this);
			_.bindAll(this, 'render');
		},
		tagName: 'tr',
		render: function() {
			this.$el.html(this.template(this.model.attributes));

			return this;
		},
		events: {
		},
		template: _.template(Template),
	});

	return CourseListItemView;
});