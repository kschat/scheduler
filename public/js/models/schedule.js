define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var ScheduleModel = Backbone.Model.extend({
		url: '/api/schedule',
		idAttribute: '_id',
		defaults: {
			courses: []
		},
		sync: function(method, model, options) {
			if(method === 'read') {
				options.url = model.url + '/' + model.id;
				if(options.populate) {
					options.url += '?populate=' + options.populate;
				}
			}

			return Backbone.sync(method, model, options);
		}
	});

	return ScheduleModel;
});