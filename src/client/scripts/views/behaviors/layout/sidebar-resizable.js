/******************************************************************************\
|                                                                              |
|                             sidebar-resizable.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a mixin for sidebar open/close/show/hide/sizing.        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Browser from '../../../utilities/web/browser.js';

export default {

	//
	// querying methods
	//

	isSideBarVisible: function() {
		return this.$el.find('> .sidebar').is(':visible');
	},

	isSideBarHidden: function() {
		return this.splitter.hidden;
	},

	isSideBarOpen: function() {
		if (!this.flipped) {
			return this.getSizes()[0] > this.getGutterSize();
		} else {
			return this.getSizes()[1] > this.getGutterSize();
		}
	},

	//
	// getting methods
	//

	getGutterSize: function() {
		return Browser.is_mobile? this.mobile_gutter_size : this.gutter_size;
	},

	getSizes: function() {
		return this.splitter.getSizes();
	},

	getInitialSideBarSize: function() {
		if (!this.flipped) {
			return this.initialSizes[0] || 50;
		} else {
			return this.initialSizes[1] || 50;
		}
	},

	//
	// setting methods
	//

	setSideBarSize: function(sidebarSize) {

		// compute sizes
		//
		if (this.flipped) {
			this.sizes = [(100 - sidebarSize), sidebarSize];
		} else {
			this.sizes = [sidebarSize, (100 - sidebarSize)];
		}

		// set pane sizes
		//
		this.splitter.setSizes(this.sizes);
		this.adjustSizes();
		this.onResize();
	},

	setSideBarMinSize: function(sidebarMinSize) {
		this.setMinSizes([sidebarMinSize, 0]);
	},

	setMinSizes: function(minSizes) {
		if (minSizes[0]) {
			switch (this.orientation) {
				case 'horizontal':
					this.$el.find('.sidebar').css('min-width', minSizes[0] + 'px');
					break;
				case 'vertical':
					this.$el.find('.sidebar').css('min-height', minSizes[0] + 'px');
					break;
			}
		}
		if (minSizes[1]) {
			switch (this.orientation) {
				case 'horizontal':
					this.$el.find('.mainbar').css('min-width', minSizes[1] + 'px');
					break;
				case 'vertical':
					this.$el.find('.mainbar').css('min-height', minSizes[1] + 'px');
					break;
			}
		}
	},

	setSideBarVisibility: function(visibility) {
		if (visibility) {
			this.showSideBar();
		} else {
			this.hideSideBar();
		}
	},

	resetSideBar: function() {
		this.splitter.setSizes(this.options.sizes || this.sizes);
		this.onResize();
	},

	//
	// converting methods
	//

	pixelsToPercent: function(sizes) {

		// convert sizes from pixels to percentages
		//
		for (let i = 0; i < sizes.length; i++) {
			if (typeof sizes[i] === 'string' && sizes[i].includes('px')) {
				sizes[i] = parseInt(sizes[i].replace('px', '')) / this.$el.width() * 100;
			}
		}

		// redistribute remaining width
		//
		let sum = 0;
		let num = 0;
		for (let i = 0; i < sizes.length; i++) {
			if (sizes[i]) {
				sum += sizes[i];
				num++;
			}
		}
		if (sum < 100) {
			let size = (100 - sum) / (sizes.length - num);
			for (let i = 0; i < sizes.length; i++) {
				if (!sizes[i]) {
					sizes[i] = size;
				}
			}
		}

		return sizes;
	},

	//
	// sidebar opening / closing methods
	//

	openSideBar: function() {
		this.setSideBarSize(this.getInitialSideBarSize());
		this.onResize();
	},

	closeSideBar: function() {
		this.prevSizes = this.getSizes();
		this.setSideBarSize(0);
	},

	toggleSideBar: function() {
		if (this.isSideBarOpen()) {
			this.closeSideBar();
		} else {
			this.openSideBar();
		}
	},

	//
	// sidebar hiding / showing methods
	//

	hideSideBar: function() {
		if (!this.splitter.hidden) {
			this.closeSideBar();
			this.$el.find('> .sidebar').hide();
			this.$el.find('> .gutter').hide();
			this.$el.find('> .mainbar').css({
				'width': '100%',
				'height': '100%'
			});
			this.splitter.hidden = true;
		}
	},

	showSideBar: function() {
		if (this.splitter.hidden) {
			this.$el.find('> .sidebar').show();
			this.$el.find('> .gutter').show();
			this.openSideBar();
			this.onResize();
			this.splitter.hidden = false;
		}
	},

	//
	// size adjustment methods
	//

	adjustWidths: function() {
		let gutterSize = this.getGutterSize();

		if (!this.flipped) {
			if (this.sizes[0] === 100) {
				this.$el.find('> .sidebar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
			if (this.sizes[1] === 100) {
				this.$el.find('> .mainbar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
		} else {
			if (this.sizes[1] === 100) {
				this.$el.find('> .sidebar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
			if (this.sizes[0] === 100) {
				this.$el.find('> .mainbar').css({
					width: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
		}
	},

	adjustHeights: function() {
		let gutterSize = this.getGutterSize();

		if (!this.flipped) {
			if (this.sizes[0] === 100) {
				this.$el.find('> .sidebar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
			if (this.sizes[1] === 100) {
				this.$el.find('> .mainbar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
		} else {
			if (this.sizes[1] === 100) {
				this.$el.find('> .sidebar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
			if (this.sizes[0] === 100) {
				this.$el.find('> .mainbar').css({
					height: 'calc(100% - ' + gutterSize + 'px)'
				});
			}
		}
	},

	adjustSizes: function() {
		switch (this.orientation) {
			case 'horizontal':
				this.adjustWidths();
				break;
			case 'vertical':
				this.adjustHeights();
				break;
		}
	}
};
