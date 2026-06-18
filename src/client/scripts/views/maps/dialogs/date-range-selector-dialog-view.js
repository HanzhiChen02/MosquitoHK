/******************************************************************************\
|                                                                              |
|                      date-range-selector-dialog-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to select a date range.            |
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
import DateRangeSelectorView from '../../../views/maps/selectors/date-range-selector-view.js';
import QueryString from '../../../utilities/web/query-string.js';

export default FilterDialogView.extend({

	//
	// attributes
	//

	className: 'modal narrow',
	icon: 'fa fa-calendar',
	title: 'Select Date',

	template: _.template(`
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<i class="<%= icon %>"></i>
				<%= title %>
			</h1>
		</div>

		<div class="modal-body">
			<p>Please select the date range that you are interested in:</p>
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
	// querying methods
	//

	hasValue: function(key) {
		return this.getChildView('selector').hasValue(key);
	},

	//
	// getting methods
	//

	getValue: function(key) {
		return this.getChildView('selector').getValue(key);
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
		this.showChildView('selector', new DateRangeSelectorView({
			start_date: QueryString.value('after'),
			end_date: QueryString.value('before')
		}));
	},

	//
	// dialog event handling methods
	//

	onClose: function() {
		if (this.hasValue('start_date')) {
			QueryString.add('after', this.getValue('start_date'));
			this.options.opener.selectButton('date');
		} else {
			QueryString.remove('after');
		}

		if (this.hasValue('end_date')) {
			QueryString.add('before', this.getValue('end_date'));
			this.options.opener.selectButton('date');
		} else {
			QueryString.remove('before');
		}

		if (!this.hasValue('start_date') && !this.hasValue('end_date')) {
			this.options.opener.deselectButton('date');
		}
	}
});