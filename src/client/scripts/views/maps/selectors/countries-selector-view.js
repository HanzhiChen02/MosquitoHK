/******************************************************************************\
|                                                                              |
|                          countries-selector-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting countries.                          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Countries from '../../../collections/countries.js';
import ItemsSelectorView from '../../../views/maps/selectors/items-selector-view.js';

export default ItemsSelectorView.extend({

	//
	// constructor
	//

	initialize: function() {
		this.collection = new Countries();
	},

	//
	// rendering methods
	//

	showItems: function(countries) {
		this.clear();
		for (let i = 0; i < countries.length; i++) {
			let country = countries.at(i);
			let id = country.attributes[0];
			let name = country.attributes[3];
			this.addItem(id, name);
		}
	},

	//
	// event handling methods
	//

	onLoad: function(countries) {
		this.showItems(countries);
		this.selectItemsFromQueryString('countries');
	}
});