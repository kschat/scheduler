define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var PaginationModel = Backbone.Model.extend({
		initialize: function(attributes) {
		},
		defaults: {
			buttonAmount: 9
		}
	});

	return PaginationModel;
});