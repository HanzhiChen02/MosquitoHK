/******************************************************************************\
|                                                                              |
|                              share-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to show a sharing link.            |
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
import '../../../library/clipboard/clipboard.min.js';

export default DialogView.extend({

	//
	// attributes
	//

	className: 'modal',
	icon: 'fa fa-share',
	title: 'Share By Link',

	template: _.template(`
		<div class="modal-header error">
			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">
				<i class="fa fa-close"></i>
			</button>
			<h1 id="modal-header-text">
				<i class="<%= icon %>"></i>
				<%= title %>
			</h1>
		</div>
		
		<div class="modal-body">
			<i class="icon fa fa-3x fa-share" style="float:left; margin-left:10px; margin-right:20px"></i>
			<a id="link" href="<%= link %>" style="word-break:break-all"><%= link %></a>
		</div>
		
		<div class="modal-footer">
			<button class="copy-link btn btn-primary" data-clipboard-target="#link">
				<i class="fa fa-copy"></i>Copy to Clipboard
			</button>
			<button id="cancel" class="btn btn" data-dismiss="modal">
				<i class="fa fa-close"></i>Cancel
			</button>
		</div>
	`),

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			title: this.title,
			icon: this.icon,
			link: this.options.link
		};
	},

	onRender: function() {

		// enable copy to clipboard
		//
		new Clipboard('.copy-link');
	}
});
