define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/loader/loading.html'
], function($, _, Backbone, Template) {
	var LoadingView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;

			_.bindAll(this, 'render', 'show', 'hide');

			this.dispatcher.on('loading:start', this.show);
			this.dispatcher.on('loading:done', this.hide);
			this.dispatcher.on('loading:stop', this.hide);

			this.render();
		},
		el: '.loading-overlay',
		template: _.template(Template),
		events: {
			
		},
		render: function() {
			this.$el.html(this.template);
			var parent = this.$el.parent();

			this.$el.css({
				'height': parent.css('height'),
				'width': parent.css('width')
			});
			return this;
		},
		show: function() {
			this.$el.show();
		},
		hide: function() {
			this.$el.fadeOut();
		}
	});

	return LoadingView;
});