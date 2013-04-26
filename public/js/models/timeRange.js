define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var TimeRangeModel = Backbone.Model.extend({
		defaults: {
			startTime: '6:00am',
			endTime: '6:30am'
		}
	});

	return TimeRangeModel;
});