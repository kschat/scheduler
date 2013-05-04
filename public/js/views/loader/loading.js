define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/loader/loading.html'
], function($, _, Backbone, Template) {
	var LoadingView = Backbone.View.extend({
		initialize: function(options) {
			this.dispatcher = options.dispatcher;

			_.bindAll(this, 'render', 'resizeLoader', 'show', 'hide');

			this.dispatcher.on('loading:start', this.show);
			this.dispatcher.on('loading:done', this.hide);
			this.dispatcher.on('loading:stop', this.hide);

			this.render();
		},
		el: '.loading-overlay',
		template: _.template(Template),
		events: {
			
		},
		resizeLoader: function() {
			var parent = this.$el.parent();

			this.$el.css({
				'height': parent.outerHeight() + parseInt(parent.css('padding-top'), 10),
				'width': parent.outerWidth(),
				'margin-left': parseInt('-' + parent.css('padding-left'), 10),
				'margin-top': parseInt('-' + parent.css('padding-top'), 10)
			});
		},
		render: function() {
			this.$el.html(this.template);
			this.resizeLoader();

			return this;
		},
		show: function() {
			console.log('show');
			this.resizeLoader();
			this.$el.show();
		},
		hide: function() {
			this.$el.fadeOut();
		}
	});

	return LoadingView;
});