require.config({
	paths: {
		underscore: 'libs/underscore/underscore-1.4.4.min',
		backbone: 	'libs/backbone/backbone-0.9.10.min',
		jquery:		'libs/jqueryjquery-1.9.1.min',
	},
	shim: {
		underscore: {
			
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone',
		},
	},
});

require([
	'app'
], function() {

});