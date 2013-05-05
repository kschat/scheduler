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
			if(method === 'read' && this.get('userName')) {
				options.url = model.url + '/?userName=' + this.get('userName');
				
				if(options.populate) {
					options.url += '&populate=' + options.populate;
				}
			}
			else if(method === 'read' && model.id) {
				options.url = model.url + '/' + model.id;
			}
			else if(method === 'update') {
				options.url = '/user/' + model.id + '/authUpdate';
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
		validateUserName: function(val) {
			return  /[a-zA-Z0-9_]{1,15}/.test(val);
		},
		validatePassword: function(val) {
			return val.length > 3;
		},
		validatePasswordSame: function(val1, val2) {
			return val1 === val2;
		},
		validate: function(attr, options) {
			if(!this.validateName(attr.firstName)) {
				return {
					message: 'First name must be between 3 and 35 characters.',
					selector: '#firstName'
				};
			}

			if(!this.validateName(attr.lastName)) {
				return { 
					message: 'Last name must be between 3 and 35 characters.',
					selector: '#lastName'
				};
			}

			if(!this.validateEmail(attr.email)) {
				return {
					message: 'Please enter a valid email address.',
					selector: '#email'
				};
			}

			if(!this.validateUserName(attr.userName)) {
				return {
					message: 'Please enter a valid user name address.',
					selector: '#userName'
				};
			}

			if(!this.validatePassword(attr.password)) {
				return { 
					message: 'Password must be at least 4 characters long.',
					selector: '#password'
				};
			}

			if(attr.passwordRepeat) {
				if(!this.validatePasswordSame(attr.password, attr.passwordRepeat)) {
					return {
						message: 'The password fields don\'t match',
						selector: '#passwordRepeat, #password'
					};
				}
			}
		}
	});

	return UserModel;
});