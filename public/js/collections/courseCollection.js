define([
	'underscore',
	'backbone',
	'models/course'
], function( _, Backbone, Course) {
	var CourseCollection = Backbone.Collection.extend({
		model: Course
	});

	return CourseCollection;
});