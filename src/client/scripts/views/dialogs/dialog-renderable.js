/******************************************************************************\
|                                                                              |
|                              dialog-renderable.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a mixin for displaying modal dialogs.                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import ErrorDialogView from '../../views/dialogs/error-dialog-view.js';
import NotifyDialogView from '../../views/dialogs/notify-dialog-view.js';
import ConfirmDialogView from '../../views/dialogs/confirm-dialog-view.js';
import '../../../vendor/bootstrap/js/modal.js';

export default  {

	//
	// dialog rendering methods
	//

	showDialog: function(dialogView, options) {
		if (this.dialogView) {

			// close existing dialog
			//
			this.dialogView.close();
			this.dialogView = null;
		} else {

			// open new dialog
			//
			dialogView.show(options);
			this.dialogView = dialogView;
			this.dialogView.options.onbeforedestroy = () => {
				this.dialogView = null;
			};
		}
	},

	showErrorDialog: function(options) {
		this.showDialog(new ErrorDialogView(options));
	},

	showNotifyDialog: function(options) {
		this.showDialog(new NotifyDialogView(options));
	},

	showConfirmDialog: function(options) {
		this.showDialog(new ConfirmDialogView(options));
	},

	destroyDialogs: function() {
		if (this.dialogView) {
			this.dialogView.destroy();
			this.dialogView = null;
		}
		this.pendingDialogView = null;
	},

	hideDialogs: function() {
		if (this.dialogView) {
			this.dialogView.hide();
			this.dialogView = null;
		}
		this.pendingDialogView = null;
	}
}