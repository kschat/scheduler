define([
	'jquery',
	'underscore',
	'backbone',
	'models/paginationButton',
	'text!templates/pagination/paginationButton.html'
], function($, _, Backbone, PaginationButtonModel, PaginationButtonTemplate) {
	var PaginationButtonView = Backbone.View.extend({
		initialize: function(options) {
			//Sets options it a new object literal if options is undefined.
			options = options || {};
			//If no model is passed into the constructor then create a new model.
			this.model = options.model || new PaginationButtonModel();
			this.template = _.template(PaginationButtonTemplate);
			_.bindAll(this, 'render');
		},
		tagName: 'li',
		model: PaginationButtonModel,
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		}
	});

	return PaginationButtonView;
});