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
				console.log(options);
				options.url = model.url + '/?skip=' + this.skip + '&limit=' + this.limit;
			}

			return Backbone.sync(method, model, options);
		},
		url: '/api/course'
	});

	return CourseCollection;
});