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
		},
		validateName: function(val) {
			return val.length >= 2 && val.length <= 35;
		},
		validateEmail: function(val) {
			return /^.+@.+\..+$/.test(val);
		},
		validatePassword: function(val) {
			return val.length > 3;
		},
		validate: function(attr, options) {
			if(!this.validateName(attr.firstName)) {
				return 'First name must be between 3 and 35 characters.';
			}

			if(!this.validateName(attr.lastName)) {
				return 'Last name must be between 3 and 35 characters.';
			}

			if(!this.validateEmail(attr.email)) {
				return 'Please enter a valid email address.';
			}

			if(!this.validatePassword(attr.password)) {
				return 'Password must be at least 4 characters long.';
			}
		}
	});

	return UserModel;
});