define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var UserModel = Backbone.Model.extend({
		defaults: {
			firstName: '',
			lastName: '',
			email: '',
		},
		url: 'api/user'
	});

	return UserModel;
});