define([
	'jquery',
	'underscore',
	'backbone',
	'views/schedule/courseSearchItem',
	'views/loader/loading',
	'collections/courseCollection',
	'text!templates/schedule/courseList.html'
], function($, _, Backbone, CourseSearchItem, LoadingOverlay, CourseCollection, Template) {
	var CourseListView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'render', 'resetList', 'searchError', 'searchSuccess', 'handleVisibility', 'addSelected', 'removeSelected', 'resetSelected');
			this.selectedCourses = options.selectedCourses;
			this.dispatcher = options.dispatcher;

			//Events called by the search view notifying this view of its state
			this.dispatcher.on('search:error', this.searchError);
			this.dispatcher.on('search:success', this.searchSuccess);
			this.dispatcher.on('pager:btnClicked', this.handleVisibility);
			this.dispatcher.on('courseList:selected', this.addSelected);
			this.dispatcher.on('courseList:removed', this.removeSelected);

			this.collection.on('add', this.resetList, this);
			this.collection.on('reset', this.resetList, this);

			this.selectedCourses.on('add', this.resetSelected, this);
			this.selectedCourses.on('reset', this.resetSelected, this);
			this.selectedCourses.on('remove', this.resetSelected, this);
		},
		el: '#course-container',
		template: _.template(Template),
		render: function() {
			this.$el.html(this.template());
			this.$list = this.$el.find('#course-list');
			this.$message = this.$el.find('#course-message');
			this.loading = new LoadingOverlay({ dispatcher: this.dispatcher, el: '#course-list-loading' });

			return this;
		},
		resetList: function() {
			this.collection.models = _.uniq(this.collection.models, true, function(i) { return i.attributes.courseNumber; });
			
			if(this.collection.length > 0) {
				//this.dispatcher.trigger('pager:enableBtn', 'next');
				this.$list.html('');
				this.$message.hide();
				var self = this;

				this.collection.each(function(course) {
					//Checks if the course is selected
					if(self.selectedCourses.get(course.attributes._id)) {
						course.attributes.isSelected = 'active';
					}
					var cv = new CourseSearchItem({ model: course, dispatcher: self.dispatcher });
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
		resetSelected: function() {
			if(this.selectedCourses.length > 0) {
				this.dispatcher.trigger('pager:enableBtn', 'next');
			}
			else {
				this.dispatcher.trigger('pager:disableBtn', 'next');
			}
		},
		searchSuccess: function(data) {
			this.dispatcher.trigger('loading:done');
		},
		searchError: function(data) {
			this.dispatcher.trigger('loading:stop');
			this.$message.html('<strong>There was an error contacting the server.</strong>').show();
		},
		handleVisibility: function(e, page) {
			if(page === 'add-classes') {
				this.$el.slideDown(800);
				this.dispatcher.trigger('pager:disableBtn', 'previous');
				this.dispatcher.trigger('pager:enableBtn', 'next');
				this.dispatcher.trigger('pager:setHref', 'previous', '#add-classes');
				this.dispatcher.trigger('pager:setHref', 'next', '#availability');
			}
			else {
				this.$el.hide();
			}
		},
		addSelected: function(model) {
			this.selectedCourses.add(model);
		},
		removeSelected: function(model) {
			this.selectedCourses.remove(model);
		}
	});

	return CourseListView;
});