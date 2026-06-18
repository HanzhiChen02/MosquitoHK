/******************************************************************************\
|                                                                              |
|                                sidebar-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a sidebar information view.                              |
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
import FooterView from '../../views/layout/footer-view.js';
import '../../../vendor/bootstrap/js/collapse.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'content',

	template: _.template(`
		<div id="footer"></div>
	`),

	regions: {
		footer: '#footer'
	},

	//
	// rendering methods
	//

	onRender: function() {
		this.showBody();
		this.showFooter();
	},

	showBody: function() {
		application.fetchTemplate('home', (html) => {
			this.$el.prepend(html);
		});
	},

	showFooter: function() {
		this.showChildView('footer', new FooterView());
	}
});