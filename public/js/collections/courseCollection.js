define([
	'underscore',
	'backbone',
	'models/course'
], function( _, Backbone, Course) {
	var CourseCollection = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.skip = options ? options.skip || 0 : 10;
			this.limit = options ? options.limit || 20 : 20;
		},
		model: Course,
		sync: function(method, model, options) {
			if(method === 'read') {
				if(options.dontPage) {
					options.url = model.url + '?courseNumber=' + options.courseNumber;
				}
				else {
					var limit = options.limit || 20, 
						skip = options.skip || 0;

					options.url = model.url + '?courseNumber=' + options.courseNumber + '&limit=' + limit + '&skip=' + skip;
				}
			}

			return Backbone.sync(method, model, options);
		},
		url: '/api/course'
	});

	return CourseCollection;
});