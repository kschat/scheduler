define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var CourseModel = Backbone.Model.extend({
		url: '/api/course',
		idAttribute: '_id'
	});

	return CourseModel;
});