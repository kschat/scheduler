define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/util/pagination.html',
], function($, _, Backbone, Template) {
	var PaginationView = Backbone.View.extend({
		initialize: function(options) {
			this.template = _.template(Template);
			//this.model.on('change', this.render, this);
			_.bindAll(this, 'render');
		},
		tagName: 'div',
		render: function() {
			this.$el.html(this.template(this.model.attributes));

			return this;
		},
	});

	return PaginationView;
});