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
			
			//Event dispatcher used to detect if the browser uri has changed
			this.dispatcher = options.dispatcher || _.clone(Backbone.Events);
			this.dispatcher.on('urlUpdate', this.updateCurrentPage);
			//this.collection.on('add', this.render, this);
			//this.collection.on('reset', this.render, this);
			_.bindAll(this, 'render', 'updateCurrentPage');
		},
		tagName: 'div',
		className: 'pagination pagination-centered',
		model: PaginationModel,
		render: function() {
			//Render the template inside of the pagination div
			this.$el.html(this.template());

			//Cache the ul element in the template since it will be used in the for loop
			var $list = this.$el.children('ul'),
				//Cache the pagination models currPage attribute.
				currPage = 2,
				begIndex = 1,
				endIndex = 9;

			if(currPage > 5) {
				begIndex = currPage - 4;
				endIndex = currPage + 4;
			}

			//Create a new button based on the button amount from the pagination model.
			for(var i=begIndex; i<endIndex+1; i++) {
				var active = i === currPage ? true : false,
					buttonModel = new PaginationModel({pageNum: i, label: i, active: active});
				//append a new button to the pagination list
				$list.append(new PaginationButton({model: buttonModel}).render().el);
			}

			//Return the view to allow for chainability
			return this;
		},
		updateCurrentPage: function(uri) {
			//Makes sure the update was a page route and updates the current page accordingly
			var page = uri.split('/');

			if(page[page.length-2] === 'page') {
				this.model.currPage = page[page.length-1];
			}
		}
	});

	return PaginationView;
});