define([
	'jquery',
	'underscore',
	'backbone',
	'views/pagination/paginationButton',
	'models/pagination',
	'models/paginationButton',
	'text!templates/pagination/pagination.html'
], function($, _, Backbone, PaginationButton, PaginationModel, PaginationButtonModel, PaginationTemplate) {
	var PaginationView = Backbone.View.extend({
		initialize: function(options) {
			options = options || {};
			this.template = _.template(PaginationTemplate);
			this.model = options.model || new PaginationModel();
			//this.collection.on('add', this.render, this);
			//this.collection.on('reset', this.render, this);
			_.bindAll(this, 'render');
		},
		tagName: 'div',
		className: 'pagination',
		model: PaginationModel,
		render: function() {
			//Render the template inside of the pagination div
			this.$el.html(this.template());

			//Cache the ul element in the template since it will be used in the for loop
			var $list = this.$el.children('ul');

			//Create a new button based on the button amount from the pagination model.
			for(var i=1; i<this.model.get('buttonAmount')+1; i++) {
				var buttonModel = new PaginationModel({pageNum: i, label: i});
				//append a new button to the pagination list
				$list.append(new PaginationButton({model: buttonModel}).render().el);
			}

			//Return the view to allow for chainability
			return this;
		}
	});

	return PaginationView;
});