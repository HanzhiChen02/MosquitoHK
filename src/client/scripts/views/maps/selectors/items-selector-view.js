/******************************************************************************\
|                                                                              |
|                            items-selector-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting items.                              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../../views/base-view.js';
import QueryString from '../../../utilities/web/query-string.js';

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="item form-check">
			<input class="form-check-input" type="checkbox" id="all">
			<label class="form-check-label" for="all">
				All
			</label>
		</div>
		<div class="items"></div>
	`),

	item: _.template(`
		<div class="item form-check">
			<input class="form-check-input" type="checkbox" id="item-<%= id %>">
			<label class="form-check-label" for="item-<%= id %>">
				<%= name %>
			</label>
		</div>
	`),

	events: {
		'change #all': 'onChangeAll'
	},

	//
	// querying methods
	//

	numItems: function() {
		return this.$el.find('.item').length;
	},

	//
	// getting methods
	//

	getSelectedIndices: function() {
		if (this.$el.find('input:not(:checked').length === 0) {
			return null;
		}

		let indices = [];
		let checkboxes = this.$el.find('input');
		for (let i = 0; i < checkboxes.length; i++) {
			let checkbox = checkboxes[i];
			if ($(checkbox).is(':checked')) {
				indices.push(i);
			}
		}
		return indices;
	},

	//
	// selection methods
	//

	selectAll: function() {
		this.$el.find('input').prop('checked', true);
		this.$el.find('#all').prop('checked', true);
	},

	deselectAll: function() {
		this.$el.find('input').prop('checked', false);
		this.$el.find('#all').prop('checked', false);
	},

	selectItems: function(items) {
		let checkboxes = this.$el.find('input');
		for (let i = 1; i < checkboxes.length; i++) {
			let checkbox = checkboxes[i];
			$(checkbox).prop('checked', items.includes(i));
		}
	},

	selectItemsFromQueryString: function(key) {
		let items = QueryString.value(key);
		if (items) {
			items = items.split(',');
			for (let i = 0; i < items.length; i++) {
				items[i] = parseInt(items[i]);
			}
			this.selectItems(items);
		} else {
			this.selectAll();
		}
	},

	//
	// rendering methods
	//

	onRender: function() {
		this.collection.fetch({

			// callbacks
			//
			success: (collection) => {
				this.onLoad(collection);
			}
		});
	},

	clear: function() {
		this.$el.find('.items').empty();
	},

	addItem: function(id, name) {
		this.$el.find('.items').append(this.item({
			id: id,
			name: name
		}));
	},

	//
	// event handling methods
	//

	onLoad: function(items) {
		this.showItems(items);
	},

	onChangeAll: function(event) {
		if ($(event.target).is(':checked')) {
			this.selectAll();
		} else {
			this.deselectAll();
		}
	}
});