define([
	'underscore',
	'backbone',
	'models/schedule'
], function( _, Backbone, Schedule) {
	var ScheduleCollection = Backbone.Collection.extend({
		initialize: function(models, options) {
		},
		model: Schedule,
		sync: function(method, model, options) {
			return Backbone.sync(method, model, options);
		},
		url: '/api/schedule'
	});

	return ScheduleCollection;
});