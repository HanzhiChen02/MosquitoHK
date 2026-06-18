/******************************************************************************\
|                                                                              |
|                            mouse-drag-behavior.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a definition of a mouse interaction behavior.                 |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import MouseBehavior from '../../../views/behaviors/mouse/mouse-behavior.js';

//
// constructor
//

function MouseDragBehavior(element, options) {

	// call superclass constructor
	//
	MouseBehavior.call(this, element, options);
	
	return this;
}

MouseDragBehavior.prototype = _.extend({}, MouseBehavior.prototype, {

	//
	// initialization methods
	//

	addMouseEventHandlers: function() {
		this.mouseDownHandler = (event) => {
			if (event.which !== this.button) {
				return;
			}

			// set start and current locations
			//
			this.start = this.getMouseLocation(event);
			this.current = this.start;

			// set to drag cursor
			//
			if (this.cursor) {
				this.setCursor(this.cursor);
			}
			
			// set mouse event handlers
			//
			this.$el.on('mousemove', this.mouseDragHandler);
			this.$el.on('mouseup', this.mouseUpHandler);

			// prevent Safari from changing the cursor
			// to an i-beam on mouse drag start events
			//
			this.$el.on('selectstart', function() {
				return false;
			});

			// handle event
			//
			this.onMouseDown(event);

			// block event from parent
			//
			this.block(event);
		};

		this.mouseDragHandler = (event) => {
			if (event.which !== this.button) {
				return;
			}

			// update current location
			//
			this.current = this.getMouseLocation(event);

			// handle event
			//
			this.onMouseDrag(event);

			// block event from parent
			//
			this.block(event);
		};

		this.mouseUpHandler = (event) => {
			if (event.which !== this.button) {
				return;
			}

			// reset cursor
			//
			if (this.cursor) {
				this.resetCursor();
			}

			// remove mouse event handlers
			//
			this.$el.off('mousemove', this.mouseDragHandler);
			this.$el.off('mouseup', this.mouseUpHandler);

			// prevent Safari from changing the cursor
			// to an i-beam on mouse drag start events
			//
			this.$el.off('selectstart');

			// handle event
			//				
			this.onMouseUp(event);
			
			// reset start and current locationss
			//
			this.start = undefined;
			this.current = undefined;
			
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

			// set start and current locations
			//
			if (this.button === 2) {
				this.start = this.getTouchLocation(event, 0);
				this.current = this.getTouchLocation(event, 1);
			} else {
				this.start = this.getTouchLocation(event, 0);
				this.current = this.start;
			}

			// handle event
			//
			this.onMouseDown(event);
			
			// set touch event handlers
			//
			this.$el.on('touchmove', this.touchMoveHandler);
			this.$el.on('touchend', this.touchEndHandler);

			// block event from parent
			//
			this.block(event);
		};

		this.touchMoveHandler = (event) => {

			// prevent rubber-band scrolling
			//
			event.preventDefault();

			// check if single or multi touch event
			//
			if (event.touches.length !== this.button) {
				return;
			}

			// update start and current locations
			//
			if (this.button === 2) {
				this.start = this.getTouchLocation(event, 0);
				this.current = this.getTouchLocation(event, 1);
			} else {
				this.current = this.getTouchLocation(event, 0);	
			}

			// handle event
			//
			this.onMouseDrag(event);

			// block event from parent
			//
			this.block(event);
		};

		this.touchEndHandler = (event) => {

			// handle event
			//				
			this.onMouseUp(event);

			// reset start and current locations
			//
			this.start = undefined;
			this.current = undefined;

			// remove mouse event handlers
			//
			this.$el.off('touchmove');
			this.$el.off('touchend');

			// block event from parent
			//
			this.block(event);
		};
	},

	//
	// querying methods
	//

	isDragged: function() {
		return this.start && (this.start !== this.current);
	},

	//
	// mouse event handling methods
	//

	onMouseDrag: function(event) {
		
		// find drag
		//
		this.drag = this.getOffset(this.start, this.current);

		// perform callback
		//
		if (this.options.onmousedrag) {
			this.options.onmousedrag(event);
		}
	}
});

export default MouseDragBehavior;