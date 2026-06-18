/******************************************************************************\
|                                                                              |
|                            genera-selector-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting genera.                             |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import ItemsSelectorView from '../../../views/maps/selectors/items-selector-view.js';

export default ItemsSelectorView.extend({

	//
	// attributes
	//

	item: _.template(`
		<div class="item form-check">
			<input class="form-check-input" type="checkbox" id="item-<%= id %>">
			<label class="form-check-label" for="item-<%= id %>">
				<i><%= name %></i>
			</label>
		</div>
	`),

	//
	// rendering methods
	//

	onRender: function() {
		this.showGenera(this.options.genera);
		this.selectItemsFromQueryString('genera');
	},

	showGenera: function(genera) {
		this.$el.find('.list').empty();
		for (let i = 0; i < genera.length; i++) {
			this.addItem(i, genera.at(i));
		}
	}
});