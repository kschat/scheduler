define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var ScheduleModel = Backbone.Model.extend({
		url: '/api/schedule',
		idAttribute: '_id',
		defaults: {
			courses: []
		}
	});

	return ScheduleModel;
});