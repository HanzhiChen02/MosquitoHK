/******************************************************************************\
|                                                                              |
|                                  main-router.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for this application.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from './views/base-view.js';
import Browser from './utilities/web/browser.js';

export default Backbone.Router.extend({

	//
	// route definitions
	//

	routes: {

		// main routes
		//
		'': 'showWelcome',

		// routes
		//
		'home': 'showHome',
		'main': 'showMain',

		// other routes
		//
		'*address': 'showInfo',

		// error routes
		//
		'#notfound': 'showNotFound'
	},

	//
	// route handlers
	//

	showWelcome: function() {
		if (Browser.is_mobile && window.location.search === '') {
			this.showHome();
		} else {
			this.showMain();
		}
	},

	showMain: function() {
		import(
			'./views/main-split-view.js'
		).then((MainSplitView) => {

			// show home view
			//
			application.show(new MainSplitView.default(), {
				full_screen: true
			});
		});
	},

	showHome: function() {
		this.showInfo('home');
	},

	showInfo: function(address) {
		application.fetchTemplate(address, (text) => {

			// show info page
			//
			application.show(new BaseView({
				template: _.template(text)
			}), {
				nav: address.includes('/')? address.split('/')[0] : address
			});
		});
	},

	//
	// error route handlers
	//

	showNotFound: function(options) {
		import(
			'./views/not-found-view.js'
		).then((NotFoundView) => {

			// show not found page
			//
			application.show(new NotFoundView.default(options));
		});
	}
});