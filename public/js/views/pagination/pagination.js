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
			//Determine if options is undefined
			options = options || {};
			this.template = _.template(PaginationTemplate);
			this.model = options.model || new PaginationModel();
			this.model.set('modelBaseUrl', options.modelBaseUrl);
			this.contentModel = options.contentModel;
			
			//Fetch the amount of models for the modelToCount and cache it in the pagination model
			this.model.fetch({
				modelToCount: this.contentModel,
				success: this.fetchCount
			});

			//Event dispatcher used to detect if the browser uri has changed
			this.dispatcher = options.dispatcher || _.clone(Backbone.Events);
			this.dispatcher.on('urlUpdate', this.updateCurrentPage(this.model));
			//this.collection.on('add', this.render, this);
			//this.collection.on('reset', this.render, this);
			_.bindAll(this, 'render', 'updateCurrentPage', 'fetchCount');
			this.model.bind('change:count', this.render);
			this.model.bind('change:currPage', this.render);
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
				currPage = parseInt(this.model.get('currPage')),
				pageAmt = parseInt(this.model.get('pageAmt')),
				begIndex = 1,
				endIndex = 9,
				active = false;

			if(currPage > 5 && currPage < pageAmt - 5) {
				begIndex = currPage - 4;
				endIndex = currPage + 4;
			}
			else if(currPage > pageAmt - 5) {
				begIndex = pageAmt - 9;
				endIndex = pageAmt;
			}

			//Create a new button based on the button amount from the pagination model.
			console.log('begIndex: ' + begIndex + ' endIndex: ' + endIndex);
			for(var i=begIndex; i<endIndex+1; i++) {
				active = i === currPage, 10 ? true : false;

				var buttonModel = new PaginationModel({
					pageNum: i,
					label: i,
					active: active,
					modelBaseUrl: this.model.get('modelBaseUrl')
				});
				//append a new button to the pagination list
				$list.append(new PaginationButton({model: buttonModel}).render().el);
			}

			//Return the view to allow for chainability
			return this;
		},
		updateCurrentPage: function(model) {
			return function(uri){
				//Makes sure the update was a page route and updates the current page accordingly
				var page = uri.split('/');

				if(page[page.length-2] === 'page') {
					model.set('currPage', page[page.length-1]);
				}
			};
		},
		fetchCount: function(that) {
			/*return function(data) {
				//Calculate the amount of pages, rounding all decimals up
				var count = data.get('count');
				that.model.set('pageAmt', Math.ceil(count / data.get('perPage')));
			};*/
		}
	});

	return PaginationView;
});