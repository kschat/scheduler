define([
	'underscore',
	'backbone',
], function( _, Backbone) {
	var UserModel = Backbone.Model.extend({
		initialize: function(attributes) {
			if(typeof attributes !== 'undefined') {
				this.set('userName', attributes.userName);
			}
		},
		defaults: {
			firstName: '',
			lastName: '',
			email: '',
			description: '',
		},
		idAttribute: '_id',
		sync: function(method, model, options) {
			if(method === 'read') {
				options.url = model.url + '/?userName=' + this.get('userName');
			}
			else if(method === 'update') {
				options.url = model.url + '/' + model.id;
			}

			return Backbone.sync(method, model, options);
		},
		url: '/api/user',
		parse: function(res) {
			return res[0];
		}
	});

	return UserModel;
});