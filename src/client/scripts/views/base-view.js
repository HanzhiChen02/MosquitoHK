/******************************************************************************\
|                                                                              |
|                                   base-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an abstract base class for creating views.               |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Hierarchical from '../views/behaviors/layout/hierarchical.js';
import TooltipShowable from '../views/behaviors/tips/tooltip-showable.js';

export default Marionette.View.extend(_.extend({}, Hierarchical, TooltipShowable, {

	//
	// constructor
	//

	initialize: function() {

		// set attributes
		//
		if (this.options.parent) {
			this.parent = this.options.parent;
		}

		// call superclass constructor
		//
		Marionette.View.prototype.initialize.call(this);
	},

	//
	// querying methods
	//

	isVisible: function() {
		return this.$el.is(':visible');
	},
	
	//
	// getting methods
	//

	getRegionNames: function() {
		let names = [];
		let regions = Object.keys(this.regions);
		for (let i = 0; i < regions.length; i++) {
			names.push(regions[i]);
		}
		return names;
	},

	getRegionElement: function(name) {
		if (this.hasRegion(name)) {
			let region = this.getRegion(name);
			return region.getEl(region.el);
		}
	},

	getElementAttributes: function(selector, attribute, modifier) {
		return $.map(this.$el.find(selector), (el) => {
			let value = $(el).attr(attribute);
			return modifier? modifier(value) : value;
		});
	},

	//
	// setting methods
	//

	setVisible: function(visibility) {
		if (visibility) {
			this.$el.show();
		} else {
			this.$el.hide();
		}
	},

	setVisibility: function(selector, visibility) {
		if (visibility) {
			this.$el.find(selector).show();
		} else {
			this.$el.find(selector).hide();
		}
	},

	//
	// rendering methods
	//

	showRegions: function() {
		if (this.showRegion) {
			let names = this.getRegionNames();

			// show child views
			//
			for (let i = 0; i < names.length; i++) {
				let name = names[i];
				if (!this.options.hidden || this.options.hidden[name]) {
					this.showRegion(name);
				}
			}
		}
	},

	showChildView: function(name, view, options) {
		if (!view) {
			return;
		}
		
		// attach child to parent
		//
		view.parent = this;

		// call superclass method
		//
		Marionette.View.prototype.showChildView.call(this, name, view, options);
	},

	reflow: function() {
		return this.el.offsetHeight;
	},

	update: function() {
		this.render();
	},

	//
	// hiding methods
	//

	hide: function() {
		this.setVisible(false);
	},

	show: function() {
		this.setVisible(true);
	},

	//
	// event handling methods
	//

	block: function(event) {

		// prevent further handling of event
		//
		event.preventDefault();
		event.stopPropagation();
	},

	//
	// cleanup methods
	//

	onDestroy: function() {

		// remove any tooltips that might have been created
		//
		this.removeTooltips();
	}
}));