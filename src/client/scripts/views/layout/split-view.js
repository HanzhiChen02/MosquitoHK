/******************************************************************************\
|                                                                              |
|                                  split-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view used for showing a split view.                    |
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
import Browser from '../../utilities/web/browser.js';
import Split from '../../../vendor/splitjs/src/split.js';
import SidebarResizable from '../../views/behaviors/layout/sidebar-resizable.js';

export default BaseView.extend(_.extend({}, SidebarResizable, {

	//
	// attributes
	//

	className: 'split-view',
	template1: _.template('<div class="split sidebar"></div><div class="split mainbar"></div>'),
	template2: _.template('<div class="split mainbar"></div><div class="split sidebar"></div>'),

	regions: {
		sidebar: {
			el: '.sidebar',
			replaceElement: false
		},
		mainbar: {
			el: '.mainbar',
			replaceElement: false
		}
	},

	events: {
		'dblclick > .gutter': 'onDoubleClickGutter',
		'tap > .gutter': 'onTapGutter'
	},

	// splitter sizes
	//
	sizes: [33, 67],
	gutter_size: 2,
	mobile_gutter_size: 0,
	prevSizes: [],
	minSizes: 0,
	orientation: 'horizontal',
	flipped: false,

	//
	// constructor
	//

	initialize: function() {

		// set attributes
		//
		if (this.options.orientation !== undefined) {
			this.orientation = this.options.orientation;
		}
		if (this.options.sizes) {
			this.sizes = this.options.sizes;
		}
		if (this.options.minSizes) {
			this.minSizes = this.options.minSizes;
		}
		if (this.options.sidebar_size) {
			if (!this.flipped) {
				this.sizes = [this.options.sidebar_size, 100 - this.options.sidebar_size];
			} else {
				this.sizes = [100 - this.options.sidebar_size, this.options.sidebar_size];
			}
		}
		this.initialSizes = [...this.sizes];
	},

	//
	// setting methods
	//

	setModel: function(model) {
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').setModel) {
			this.getChildView('sidebar').setModel(model);
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').setModel) {
			this.getChildView('mainbar').setModel(model);
		}
	},

	setOrientation: function(orientation) {
		switch (orientation) {
			case 'horizontal':
				this.$el.find('> .split').removeClass('split-vertical').addClass('split-horizontal');
				break;
			case 'vertical':
				this.$el.find('> .split').removeClass('split-horizontal').addClass('split-vertical');
				break;
		}
	},

	//
	// rendering methods
	//

	getTemplate: function() {
		if (!this.flipped) {
			return this.template1;
		} else {
			return this.template2;
		}
	},

	onRender: function() {

		// show splitter
		//
		this.showSplitter();

		// show child views
		//
		if (this.getSideBarView) {
			this.showChildView('sidebar', this.getSideBarView());
		}
		if (this.getMainBarView) {
			this.showChildView('mainbar', this.getMainBarView());
		}

		// set initial state
		//
		if (this.show_sidebar === false) {
			this.hideSideBar();
		}
	},

	onAttach: function() {
		if (!this.splitter.hidden) {
			this.adjustSizes();
		}
	},

	showSplitter: function() {

		// set to horizontal or vertical
		//
		this.setOrientation(this.orientation);

		// create splitter
		//
		this.splitter = Split(!this.flipped? [
			this.$el.find('> .sidebar')[0],
			this.$el.find('> .mainbar')[0]
		] : [
			this.$el.find('> .mainbar')[0],
			this.$el.find('> .sidebar')[0]
		], {

			// options
			//
			direction: this.orientation,
			sizes: this.sizes,
			minSize: this.minSizes,
			gutterSize: this.getGutterSize(),

			// callbacks
			//
			onDrag: () => {
				this.onResize();
			}
		});
	},

	update: function() {

		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').update) {
			this.getChildView('sidebar').update();
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').update) {
			this.getChildView('mainbar').update();
		}
	},

	//
	// event handling methods
	//

	onLoad: function() {

		// check that view still exists
		//
		if (this.isDestroyed()) {
			return;
		}

		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onLoad) {
			this.getChildView('sidebar').onLoad();
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onLoad) {
			this.getChildView('mainbar').onLoad();
		}
	},

	onChange: function() {

		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onChange) {
			this.getChildView('sidebar').onChange();
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onChange) {
			this.getChildView('mainbar').onChange();
		}
	},

	//
	// mouse event handling methods
	//

	onDoubleClickGutter: function() {
		this.resetSideBar();
	},

	onTapGutter: function() {
		if (Browser.is_mobile) {
			this.toggleSideBar();
		}
	},

	//
	// window event handling methods
	//

	onResize: function(event) {

		// apply to child views
		//
		if (this.hasChildView('sidebar') && this.getChildView('sidebar').onResize) {
			this.getChildView('sidebar').onResize(event);
		}
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onResize) {
			this.getChildView('mainbar').onResize(event);
		}
	},
}));
