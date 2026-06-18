/******************************************************************************\
|                                                                              |
|                               toolbar-view.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the toolbar used to hide and show activities.            |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'toolbar',

	//
	// constructor
	//

	initialize: function(options) {

		// set attributes
		//
		this.options = options || {};
		this.parent = options? options.parent : undefined;
	},

	//
	// rendering methods
	//

	onRender: function() {

		// add tooltip triggers
		//
		this.addTooltips();
	},

	//
	// querying methods
	//

	isVisible: function() {
		return this.$el.is(':visible');
	}
});