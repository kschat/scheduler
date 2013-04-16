define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var CourseModel = Backbone.Model.extend({
		url: '/api/course'
	});

	return CourseModel;
});