define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var PaginationModel = Backbone.Model.extend({
		initialize: function(attributes) {
			_.bindAll(this, 'updatePageAmt');
			this.bind('change:count', this.updatePageAmt);

			var pathname = window.location.pathname.split('/');
			this.set('currPage', pathname[pathname.length-2] === 'page' ? parseInt(pathname[pathname.length-1], 10) : 1);
		},
		defaults: {
			buttonAmount: 9,
			currPage: 1,
			count: 1,
			perPage: 20,
			pageAmt: 1,
			modelBaseUrl: '/'
		},
		//Override the set function to allow for saftey checks before setting a value
		set: function(attributes, options) {
			//Checks if the user is trying to set the value of currPage to something less than 0,
			//sets it equal to 1 if they are.
			if(typeof attributes === 'string') {
				if(attributes === 'currPage' && options < 1) {
					attributes = 1;
				}
			}
			else if(typeof attributes === 'object') {
				if(attributes.currPage && attributes.currPage < 1) {
					attributes.currPage = 1;
				}
			}

			return Backbone.Model.prototype.set.call(this, attributes, options);
		},
		//Override the sync function to allow for dynamic models
		sync: function(method, model, options) {
			if(method === 'read') {
				var filter = options.filter ? '&' + options.filter : '';
				options.url = '/api/' + options.modelToCount + '/?count=true' + filter;
			}

			return Backbone.sync(method, model, options);
		},
		updatePageAmt: function() {
			//Calculate the amount of pages, rounding all decimals up
			this.set('pageAmt', Math.ceil(this.get('count') / this.get('perPage')));

			//Makes sure the current page stays within the page amount range.
			if(this.get('currPage') > this.get('pageAmt')) {
				this.set('currPage', this.get('pageAmt'));
			}
		}
	});

	return PaginationModel;
});