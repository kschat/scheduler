define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/schedule/courseItem.html'
], function($, _, Backbone, Template) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render', 'toggleSelection');
			this.dispatcher = options.dispatcher;
		},
		tagName: 'li',
		template: _.template(Template),
		events: {
			'click': 'toggleSelection'
		},
		render: function() {
			this.model.attributes.isSelected = this.model.attributes.isSelected || '';
			//console.log(this.model.attributes);
			this.$el.html(this.template(this.model.attributes)).addClass(this.model.attributes.isSelected);

			return this;
		},
		toggleSelection: function(e) {
			if(this.$el.hasClass('active')) {
				this.dispatcher.trigger('courseList:removed', this.model);
				this.$el.removeClass('active');
			}
			else {
				this.dispatcher.trigger('courseList:selected', this.model);
				this.$el.addClass('active');
			}
		}
	});

	return CourseListView;
});