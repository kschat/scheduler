define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var PaginationModel = Backbone.Model.extend({
		initialize: function(attributes) {
		},
		defaults: {
			buttonAmount: 9,
			currPage: 1
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
		}
	});

	return PaginationModel;
});