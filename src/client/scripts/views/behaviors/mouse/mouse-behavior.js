/******************************************************************************\
|                                                                              |
|                              mouse-behavior.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a definition of an abstract mouse behavior.                   |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Browser from '../../../utilities/web/browser.js';

//
// constructor
//

function MouseBehavior(element, options) {
	if (!element) {
		return;
	}

	// set optional parameter defaults
	//
	if (!options) {
		options = {};
	}
	if (options.on === undefined) {
		options.on = true;
	}
	if (options.cursor === undefined) {
		options.cursor = this.cursor;
	}
	if (options.button === undefined) {
		options.button = 1;
	}
	if (options.blocking === undefined) {
		options.blocking = this.blocking;
	}
	
	// set attributes
	//
	this.$el = $(element);
	this.el = $(element)[0];
	this.cursor = options.cursor;
	this.button = options.button;
	this.blocking = options.blocking;
	this.options = options;

	//
	// create event handlers
	//
	if (Browser.is_touch_enabled) {
		this.addTouchEventHandlers();
	} else {
		this.addMouseEventHandlers();
	}

	// activate behavior
	//
	if (this.options.on) {
		this.on();
	}
	
	return this;
}

MouseBehavior.prototype = _.extend({}, MouseBehavior.prototype, {

	//
	// attributes
	//

	blocking: false,

	//
	// initialization methods
	//

	addMouseEventHandlers: function() {
		this.mouseDownHandler = (event) => {
			if (event.which !== this.button) {
				return;
			}
			
			// set mouse event handlers
			//
			this.$el.on('mouseup', this.mouseUpHandler);

			// handle event
			//
			this.onMouseDown(event);

			// block event from parent
			//
			this.block(event);
		};

		this.mouseUpHandler = (event) => {
			if (event.which !== this.button) {
				return;
			}

			// remove mouse event handlers
			//
			this.$el.off('mouseup', this.mouseUpHandler);

			// handle event
			//				
			this.onMouseUp(event);
			
			// block event from parent
			//
			this.block(event);
		};
	},

	addTouchEventHandlers: function() {
		this.touchStartHandler = (event) => {

			// check if single or multi touch event
			//
			if (event.touches.length !== this.button) {
				return;
			}

			// handle event
			//
			this.onMouseDown(event);
			
			// set touch event handlers
			//
			this.$el.on('touchend', this.touchEndHandler);

			// block event from parent
			//
			this.block(event);
		};

		this.touchEndHandler = (event) => {

			// handle event
			//				
			this.onMouseUp(event);

			// remove mouse event handlers
			//
			this.$el.off('touchend');

			// block event from parent
			//
			this.block(event);
		};
	},

	//
	// getting methods
	//

	getTouchLocation: function(event, index) {
		return {
			left: event.touches[index].clientX,
			top: event.touches[index].clientY
		};
	},

	getMouseLocation: function(event) {
		return {
			left: event.clientX,
			top: event.clientY
		};
	},

	getMouseOffset: function(event) {
		return {
			left: event.offsetX,
			top: event.offsetY
		};
	},

	getOffset: function(start, finish) {
		return {
			left: finish.left - start.left,
			top: finish.top - start.top
		};
	},

	getDistance: function(start, finish) {
		return Math.sqrt(Math.sqr(start.left - finish.left) + Math.sqr(start.top - finish.top));
	},

	getRect: function(start, finish) {
		return {
			left: start.left < finish.left? start.left : finish.left,
			top: start.top < finish.top? start.top : finish.top,
			width: Math.abs(finish.left - start.left),
			height: Math.abs(finish.top - start.top)
		};
	},

	getCursor: function() {
		return this.$el.css('cursor');
	},

	//
	// setting methods
	//

	setCursor: function(cursor) {
		this.previousCursor = this.getCursor();
		this.$el.css('cursor', cursor);
	},

	resetCursor: function() {
		this.setCursor(this.previousCursor);
	},

	//
	// activating methods
	//

	on: function() {
		if (Browser.is_touch_enabled) {

			// bind touch event handlers
			//
			this.$el.on('touchstart', this.touchStartHandler);
		} else {

			// bind mouse event handlers
			//
			this.$el.on('mousedown', this.mouseDownHandler);
		}
	},

	off: function() {
		if (Browser.is_touch_enabled) {

			// unbind touch event handlers
			//
			this.$el.off('touchstart', this.touchStartHandler);
		} else {
			
			// unbind mouse event handlers
			//
			this.$el.off('mousedown', this.mouseDownHandler);
		}
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

	onMouseDown: function(event) {

		// perform callback
		//
		if (this.options.onmousedown) {
			this.options.onmousedown(event);
		}
	},

	onMouseUp: function(event) {

		// perform callback
		//
		if (this.options.onmouseup) {
			this.options.onmouseup(event);
		}
	}
});

export default MouseBehavior;