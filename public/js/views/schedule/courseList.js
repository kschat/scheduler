define([
	'jquery',
	'underscore',
	'backbone',
	'views/schedule/courseSearchItem',
	'views/loader/loading',
	'text!templates/schedule/courseList.html'
], function($, _, Backbone, CourseSearchItem, LoadingOverlay, Template) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render', 'resetList', 'searchError', 'searchSuccess', 'handleVisibility');
			this.dispatcher = options.dispatcher;

			//Events called by the search view notifying this view of its state
			this.dispatcher.on('search:error', this.searchError);
			this.dispatcher.on('search:success', this.searchSuccess);
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);

			this.collection.on('add', this.resetList, this);
			this.collection.on('reset', this.resetList, this);
		},
		el: '#course-container',
		template: _.template(Template),
		render: function() {
			this.$el.html(this.template());
			this.$list = this.$el.find('#course-list');
			this.$message = this.$el.find('#course-message');
			this.loading = new LoadingOverlay({ dispatcher: this.dispatcher });

			return this;
		},
		resetList: function() {
			if(this.collection.length > 0) {
				this.$list.html('');
				this.$message.hide();
				var self = this;
				this.collection.each(function(course) {
					var cv = new CourseSearchItem({ model: course });
					self.$list.append(cv.render().el);
				});

				this.$list.fadeIn(700);
			}
			else {
				this.$list.hide();
				this.$message.html('<strong>No classes found.</strong>').show();
			}

			return this;
		},
		searchSuccess: function(data) {
			this.dispatcher.trigger('loading:done');
		},
		searchError: function(data) {
			this.dispatcher.trigger('loading:stop');
			this.$message.html('<strong>There was an error contacting the server.</strong>').show();
		},
		handleVisibility: function(e) {
			if(e.target.hash === '#add-classes') {
				this.$el.fadeIn();
				this.dispatcher.trigger('pager:disableBtn', 'previous');

			}
			else {
				this.$el.hide();
			}
		}
	});

	return CourseListView;
});