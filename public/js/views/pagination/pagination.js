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
			this.collection = options.collection;
			this.contentModel = options.contentModel;
			this.model = options.model || new PaginationModel();
			this.model.set('modelBaseUrl', options.modelBaseUrl);

			this.dispatcher = options.dispatcher;
			_.bindAll(this, 'render', 'build', 'updateBaseUrl', 'updateCurrPage');
			this.model.bind('change:count', this.render);
			this.model.bind('change:currPage', this.render);

			this.dispatcher.on('course:search:submit', this.build);
			this.dispatcher.on('pagination:baseurl', this.updateBaseUrl);
			this.dispatcher.on('pagination:pageupdate', this.updateCurrPage);
		},
		el: '.pagination',
		model: PaginationModel,
		//Function used to grab all the metadata required to construct the UI properly
		build: function(model, filter) {
			var param = filter.split('=')[1],
				filter = filter.split('=')[0];
			
			filter = param === 'all' ? filter + '=' : filter + '=' + param;

			//Fetch the amount of models for the modelToCount and cache it in the pagination model
			this.model.fetch({
				modelToCount: model,
				filter: filter,
				success: this.render
			});

			this.dispatcher.trigger('pagination:page', 
					parseInt((this.model.get('currPage') - 1) * this.model.get('perPage'), 10), 
					this.model.get('perPage'));
		},
		updateBaseUrl: function(url) {
			this.model.set('modelBaseUrl', url);
		},
		updateCurrPage: function(e, filter) {
			//Checks if filter was passed to the function and if it was, if it's equal to all
			filter = !filter ? null : filter === 'all' ? '' : filter;

			var page = e.target ? e.target.text : e;
			this.model.set('currPage', page);

			//Sends a global event stating that the page has been updated.
			this.dispatcher.trigger('pagination:page', 
					parseInt((this.model.get('currPage') - 1) * this.model.get('perPage'), 10), 
					this.model.get('perPage'),
					filter);
		},
		events: {
			'click a': 'updateCurrPage'
		},
		render: function() {
			//Render the template inside of the pagination div
			this.$el.html(this.template());

			//Cache the ul element in the template since it will be used in the for loop
			var $list = this.$el.children('ul'),
				//Cache the pagination models currPage attribute.
				currPage = parseInt(this.model.get('currPage'), 10),
				pageAmt = parseInt(this.model.get('pageAmt'), 10),
				begIndex = currPage - 4,
				endIndex = currPage + 4,
				active = false;

			//Checks if we want to display the first 9 pages
			if(currPage - 5 < 0) {
				begIndex = 1;
				endIndex = 9;
			}
			//Checks if we want to display the last 9 pages
			else if(currPage > pageAmt - 5) {
				begIndex = pageAmt - 9;
				endIndex = pageAmt;
			}

			//Makes sure the indexes don't exceed the boundries of the pages
			endIndex = endIndex > pageAmt ? pageAmt : endIndex;
			begIndex = begIndex < 1 ? 1 : begIndex;

			//Create a new button based on the button amount from the pagination model.
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
		}
	});

	return PaginationView;
});