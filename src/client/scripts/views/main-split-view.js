/******************************************************************************\
|                                                                              |
|                              main-split-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level view of our application.                   |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import SplitView from '../views/layout/split-view.js';
import SideBarView from '../views/sidebar/sidebar-view.js';
import MosquitoMapView from '../views/maps/mosquito-map-view.js';

export default SplitView.extend({

	//
	// attributes
	//

	orientation: $(window).width() < 640? 'vertical': 'horizontal',
	flipped: false,
	sizes: $(window).width() < 640? [0, 100] : [25, 75],

	//
	// view getting methods
	//

	getMainBarView: function() {
		return new MosquitoMapView({
			el: this.$el.find('.mainbar')[0]
		});
	},

	getSideBarView: function() {
		return new SideBarView({

			// options
			//
			selectedTerms: this.selectedTerms,
			expandedTerms: this.expandedTerms,
			selectedAppointments: this.selectedAppointments,
			expandedAppointments: this.expandedAppointments,
			showAffiliates: this.showAffiliates,

			// callbacks
			//
			onclick: (filters) => this.onClickCheckbox(filters)
		});
	},

	getInitialSideBarSize: function() {
		return 60;
	},

	//
	// rendering methods
	//

	onRender: function() {

		// call superclass method
		//
		SplitView.prototype.onRender.call(this);

		// set up resize callback
		//
		$(window).bind('resize', () => {
			this.onResize();
		});
	},

	//
	// event handling methods
	//

	onStart: function() {

		// perform callback
		//
		if (this.options.onstart) {
			this.options.onstart();
		}
	},

	//
	// window event handling methods
	//

	onResize: function() {
		if (this.hasChildView('mainbar') && this.getChildView('mainbar').onResize) {
			this.getChildView('mainbar').onResize();
		}
	}
});