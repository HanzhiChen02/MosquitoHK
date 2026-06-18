/******************************************************************************\
|                                                                              |
|                             notify-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to show a notification.            |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import DialogView from '../../views/dialogs/dialog-view.js';

export default DialogView.extend({

	//
	// attributes
	//

	className: 'focused modal notify-dialog',

	template: _.template(`
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<% if (icon) { %>
				<i class="<%= icon %>"></i>
				<% } else { %>
				<i class="fa fa-info-circle"></i>
				<% } %>
				<% if (title) { %>
				<%= title %>
				<% } else { %>
				Notification
				<% } %>
			</h1>
		</div>
		
		<div class="modal-body">
			<p><%= message %></p>
		</div>
		
		<div class="modal-footer">
			<button id="ok" class="btn btn-primary" data-dismiss="modal">
				<i class="fa fa-check"></i>OK
			</button>
		</div>
	`),

	events: {
		'click #ok': 'onClickOk'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			title: this.options.title,
			icon: this.options.icon,
			message: this.options.message
		};
	},

	//
	// mouse event handling methods
	//

	onClickOk: function() {

		// perform callback
		//
		if (this.options.accept) {
			this.options.accept();
		}
	}
});
