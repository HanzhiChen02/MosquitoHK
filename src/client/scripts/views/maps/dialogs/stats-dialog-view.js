/******************************************************************************\
|                                                                              |
|                              stats-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to display statistics.             |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import DialogView from '../../../views/dialogs/dialog-view.js';
import StatsView from '../../../views/maps/stats-view.js';

export default DialogView.extend({

	//
	// attributes
	//

	className: 'modal narrow',
	icon: 'fa fa-table',
	title: 'Statistics',

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
			<p>Number of observations:</p>
			<div class="stats"></div>
		</div>

		<div class="modal-footer">
			<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button>
		</div>
	`),

	regions: {
		stats: '.stats'
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
		this.showChildView('stats', new StatsView());
	}
});