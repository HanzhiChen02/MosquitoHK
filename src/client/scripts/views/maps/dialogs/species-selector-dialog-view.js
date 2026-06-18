/******************************************************************************\
|                                                                              |
|                        species-selector-dialog-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to select species.                 |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import FilterDialogView from '../../../views/maps/dialogs/filter-dialog-view.js';
import SpeciesSelectorView from '../../../views/maps/selectors/species-selector-view.js';
import QueryString from '../../../utilities/web/query-string.js';

export default FilterDialogView.extend({

	//
	// attributes
	//

	className: 'modal narrow',
	icon: 'fa fa-mosquito',
	title: 'Select Species',

	template: _.template(`
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<i class="<%= icon %>" style="transform:scale(0.75)"></i>
				<%= title %>
			</h1>
		</div>

		<div class="modal-body">
			<p>Please select the species that you are interested in:</p>
			<div class="selector"></div>
		</div>

		<div class="modal-footer">
			<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button>
			<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-close"></i>Cancel</button>
		</div>
	`),

	regions: {
		selector: '.selector'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			icon: this.icon,
			title: this.title
		};
	},

	onRender: function() {
		this.showChildView('selector', new SpeciesSelectorView({
			species: this.options.species
		}));
	},

	//
	// dialog event handling methods
	//

	onClose: function() {
		let indices = this.getChildView('selector').getSelectedIndices();
		if (indices) {
			QueryString.add('species', indices);
			this.options.opener.selectButton('species');
		} else {
			QueryString.remove('species', indices);
			this.options.opener.deselectButton('species');
		}
	}
});