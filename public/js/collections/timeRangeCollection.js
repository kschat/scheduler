define([
	'underscore',
	'backbone',
	'models/timeRange'
], function( _, Backbone, TimeRange) {
	var TimeRangeCollection = Backbone.Collection.extend({
		initialize: function(models, options) {
		},
		model: TimeRange
	});

	return TimeRangeCollection;
});