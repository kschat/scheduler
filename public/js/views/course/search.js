define([
	'jquery',
	'underscore',
	'backbone',
	'views/course/searchNode',
	'models/course',
	'collections/courseCollection',
], function($, _, Backbone, SearchNode, Course, CourseCollection) {
	var SearchView = Backbone.View.extend({
		initialize: function(options) {
			this.$resultDropdown = this.$el.find('#search-results');

			_.bindAll(this, 'render', 'appendResults');
			this.render();
		},
		render: function() {
			this.$resultDropdown.hide();
			$('#adv-btn').tooltip();
			return this;
		},
		resetDropdown: function() {
			this.$resultDropdown.find('.header').text('Start typing...');
			this.$resultDropdown.hide();
			return this;
		},
		events: {
			'focus > input[type="text"]': 	'focusSearch',
			'blur > input[type="text"]': 	'blurSearchText',
			'focus #search-results': 		'focusDropdown',
			'mouseover #search-results': 	'focusDropdown',
			'mouseout #search-results': 	'blurDropdown',
			'keyup > input[type="text"]': 	'changeSearch'
		},
		el: '#course-search',
		appendResults: function(data) {
			this.$resultDropdown.find('.header').nextAll('li').remove();
			for(var i=0; i<data.length; i++) {
				var node = new SearchNode({ model: new Course(data[i]) });
			}
		},
		focusSearch: function() {
			this.$el.addClass('hover');
			var that = this;
			this.$el.find('#search-textfield').animate({'width': 350}, 300, 'swing', function() {
				that.$resultDropdown.show();
			});
		},
		focusDropdown: function() {
			this.$resultDropdown.addClass('hover');
			this.$resultDropdown.show();
		},
		blurSearchText: function() {
			this.$el.removeClass('hover');
			this.blurSearch();
		},
		blurDropdown: 	function() {
			this.$resultDropdown.removeClass('hover');
			this.blurSearch();
		},
		blurSearch: function() {
			if(!this.$el.hasClass('hover') && !this.$resultDropdown.hasClass('hover')) {
				this.$resultDropdown.hide();
				this.$el.find('#search-textfield').animate({'width': 206}, 500);
			}
		},
		changeSearch: function() {
			var searchText = this.$el.find('#search-textfield'),
				header = this.$resultDropdown.find('.header');

			if(searchText.val() === '') {
				this.$resultDropdown.find('.header').nextAll('li').remove();
				header.text('Start typing...');
			}
			else {
				header.text('Courses');

				$.ajax({
					url: '/api/course?limit=4&courseNumber=' + searchText.val(),
					type: 'GET',
				}).done(this.appendResults);
			}
		}
	});

	return SearchView;
});