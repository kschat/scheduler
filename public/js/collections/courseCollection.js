define([
	'underscore',
	'backbone',
	'models/course'
], function( _, Backbone, Course) {
	var CourseCollection = Backbone.Collection.extend({
		model: Course,
		sync: function(method, model, options) {

			if(method === 'read') {
				var limit = options.limit || 20, 
					skip = options.skip || 0;

				options.url = model.url + '?courseNumber=' + options.courseNumber + '&limit=' + limit + '&skip=' + skip;
			}

			return Backbone.sync(method, model, options);
		},
		url: '/api/course'
	});

	return CourseCollection;
});