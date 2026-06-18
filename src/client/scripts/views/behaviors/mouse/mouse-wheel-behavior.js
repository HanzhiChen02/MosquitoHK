/******************************************************************************\
|                                                                              |
|                              mouse-wheel-behavior.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a definition of a mouse wheel interaction behavior.           |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../../../vendor/jquery/mouse-wheel/jquery.mousewheel.js';

//
// constructor
//

function MouseWheelBehavior(element, options) {

	// set optional parameter defaults
	//
	if (!options) {
		options = {};
	}
	if (options.on === undefined) {
		options.on = true;
	}
	if (options.blocking === undefined) {
		options.blocking = false;
	}

	// set attributes
	//
	this.el = element;
	this.$el = $(element);
	this.blocking = options.blocking;
	this.options = options;

	// create event handler
	//
	this.mouseWheelHandler = (event) => {

		// disable native scroll
		//
		if (event.preventDefault) {

			// prevent default scroll behavior
			//
			event.preventDefault();
		} else {
			
			// IE fix
			//
			event.returnValue = false;
		}
		$('body, html, document').stop().animate({}, 'slow');

		// handle event
		//
		this.onWheelMove(event);
	};

	// activate behavior
	//
	if (this.options.on) {
		this.on();
	}

	return this;
}

//
// extend prototype from "superclass"
//

_.extend(MouseWheelBehavior.prototype, {

	//
	// activating methods
	//

	on: function() {

		// bind event handlers
		//
		this.$el.on('mousewheel', this.mouseWheelHandler);
	},

	off: function() {

		// unbind event handlers
		//
		this.$el.off('mousewheel', this.mouseWheelHandler);
	},

	block: function(event) {

		// block event from parent
		//
		if (this.blocking) {
			event.stopPropagation();
			event.preventDefault();
		}
	},

	//
	// mouse event handling methods
	//

	onWheelMove: function(event) {

		// perform callback
		//
		if (this.options.onmousewheel) {
			this.options.onmousewheel(event);
		}

		// block event from parent
		//
		this.block(event);
	}
});

export default MouseWheelBehavior;