require.config({
	paths: {
		underscore: 'libs/underscore/underscore-1.4.4.min',
		backbone: 	'libs/backbone/backbone-0.9.10.min',
		jquery:		'libs/jquery/jquery-1.9.1.min',
		bootstrap: 	'libs/bootstrap/bootstrap.min',
		text: 		'libs/require/text/text',
		ajaxForm: 	'libs/jquery/form/ajaxForm'
	},
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: 		['underscore', 'jquery'],
			exports: 	'Backbone'
		},
		bootstrap: {
			deps: ['jquery']
		},
		ajaxForm: {
			deps: ['jquery'],
			exports: 'jQuery.fn.ajaxForm'
		}
	},
});

require([
	'app'
], function(App) {
	App.initialize();
});