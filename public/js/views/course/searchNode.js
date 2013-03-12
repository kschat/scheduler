define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/course/searchNode.html',
], function($, _, Backbone, SearchNodeTemplate) {
	var SearchNodeView = Backbone.View.extend({
		initialize: function(options) {
			this.model = options.model;
			_.bindAll(this, 'render');
			this.render();
		},
		el: '#search-results',
		template: _.template(SearchNodeTemplate),
		render: function() {
			this.$el.append(this.template(this.model.attributes));
			return this;
		},
	});

	return SearchNodeView;
});