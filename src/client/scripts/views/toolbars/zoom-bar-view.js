/******************************************************************************\
|                                                                              |
|                             zoom-bar-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the navigations controls.                                |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import ToolbarView from './toolbar-view.js';

export default ToolbarView.extend({

	//
	// attributes
	//

	id: 'zoom-bar',
	className: 'vertical toolbar',

	template: _.template(`
		<div class="buttons">
			<button id="zoom-in" data-toggle="tooltip" title="Zoom In" data-placement="left"><i class="fa fa-plus"></i></button>
			<div class="current" data-toggle="tooltip" title="Zoom Level" data-placement="left">1</div>
			<button id="zoom-out" data-toggle="tooltip" title="Zoom Out" data-placement="left"><i class="fa fa-minus"></i></button>
		</div>
	`),

	events: {
		'click #zoom-in': 'onClickZoomIn',
		'click #zoom-out': 'onClickZoomOut'
	},

	//
	// setting methods
	//

	setZoomLevel: function(zoomLevel) {
		this.$el.find('.current').text(Math.round(zoomLevel));
	},

	//
	// rendering methods
	//

	onRender: function() {

		// call superclass method
		//
		ToolbarView.prototype.onRender.call(this);

		// set initial state
		//
		this.setZoomLevel(this.options.zoomLevel);
	},

	//
	// mouse event handling methods
	//

	onClickZoomIn: function() {
		this.parent.zoomIn();
	},

	onClickZoomOut: function() {
		this.parent.zoomOut();
	}
});