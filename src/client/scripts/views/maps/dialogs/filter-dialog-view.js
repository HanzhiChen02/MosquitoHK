/******************************************************************************\
|                                                                              |
|                             filter-dialog-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to filter map information.         |
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

export default DialogView.extend({

	//
	// attributes
	//

	events: {
		'keydown': 'onKeyDown',
		'click #ok': 'onClickOk'
	},

	//
	// dialog methods
	//

	closeDialog: function() {
		this.$el.modal('hide');

		// perform callback
		//
		if (this.onClose) {
			this.onClose();
		}

		// update map
		//
		application.getMapView().update();
	},

	//
	// mouse event handling methods
	//

	onClickOk: function() {
		this.closeDialog();
	},

	//
	// keyboard event handling methods
	//

	onKeyDown: function(event) {
		if (event.keyCode === 13) {
			this.closeDialog();
		}
	}
});