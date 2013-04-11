define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var PaginationButtonModel = Backbone.Model.extend({
		initialize: function(attributes) {
		},
		defaults: {
			pageNum: 1,
			label: ''
		}
	});

	return PaginationButtonModel;
});