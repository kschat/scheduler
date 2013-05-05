/**
* Course Backbone.js model
*
* @param {String} url REST url to call
* @param {String} idAttribute sets the id for the model
*/
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