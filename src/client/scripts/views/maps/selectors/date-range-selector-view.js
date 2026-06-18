/******************************************************************************\
|                                                                              |
|                         date-range-selector-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a date range.                       |
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

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="form-group">
			<label for="start-date">Start date:</label>
			<input type="date" class="form-control" id="start-date" value="<%= start_date %>">
		</div>

		<div class="form-group">
			<label for="end-date">End date:</label>
			<input type="date" class="form-control" id="end-date" value="<%= end_date %>">
		</div>
	`),

	//
	// querying methods
	//

	hasValue: function(key) {
		switch (key) {
			case 'start_date':
				return this.getValue('start_date') !== '';
			case 'end_date':
				return this.getValue('end_date') !== '';
		}
	},

	//
	// getting methods
	//

	getValue: function(key) {
		switch (key) {
			case 'start_date':
				return this.$el.find('#start-date').val();
			case 'end_date':
				return this.$el.find('#end-date').val();
		}
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return this.options;
	}
});