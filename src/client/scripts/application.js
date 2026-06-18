/******************************************************************************\
|                                                                              |
|                                application.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level application.                               |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Router from './router.js';
import MainView from './views/layout/main-view.js';
import PageView from './views/layout/page-view.js';
import DialogView from './views/dialogs/dialog-view.js';
import DialogRenderable from './views/dialogs/dialog-renderable.js';
import Browser from './utilities/web/browser.js';
import QueryString from './utilities/web/query-string.js';

// system utilities
//
import './utilities/time/date-format.js';
import './utilities/web/html-utils.js';

export default Marionette.Application.extend(_.extend({}, DialogRenderable, {

	//
	// attributes
	//

	templates: 'templates',

	region: {
		el: 'body',
		replaceElement: false
	},

	spinner: `
		<div class="spinner overlay">
			<div class="icon">
				<i class="fa fa-spinner fa-5x fa-spin"></i>
			</div>
		</div>
	`,

	//
	// constructor
	//

	initialize: function(options) {

		// make config and defaults globally accessible
		//
		if (options && options.config) {
			window.config = options.config;
			window.defaults = options.defaults;
		}

		// add helpful class for mobile OS'es
		//
		$('body').attr('device', Browser.device);
		if (Browser.device === 'phone' || Browser.device === 'tablet') {
			$('body').addClass('mobile');
		}

		// store handle to application
		//
		window.application = this;

		// create router
		//
		if (!this.router) {
			this.router = new Router();
		}

		// toggle dark mode
		//
		if (QueryString.value('dark')) {
			this.setDarkMode(true);
		}
	},

	//
	// getting methods
	//

	getURL: function() {
		let protocol = window.location.protocol;
		let hostname = window.location.host;
		let pathname = window.location.pathname;
		return protocol + '//' + hostname + pathname;
	},

	getChildView: function(name) {
		return this.getView().getChildView(name);
	},

	getMapView: function() {
		return this.getView().getChildView('content').getChildView('mainbar');
	},

	//
	// startup methods
	//

	start: function() {

		// call superclass method
		//
		Marionette.Application.prototype.start.call(this);

		// call initializer
		//
		this.initialize();

		// start router
		//
		Backbone.history.start();
	},

	//
	// ajax methods
	//

	fetchTemplate(address, callback) {
		fetch(this.templates + '/' + address + '.tpl').then(response => {
			if (!response.ok) {
				throw response;
			}
			return response.text();
		}).then(template => {
			callback(template);
			return;
		}).catch(error => {

			// show 404 page
			//
			this.router.showNotFound(error);
		});
	},

	//
	// rendering methods
	//

	setDarkMode: function(dark) {
		if (dark) {
			$('body').addClass('dark');
		} else {
			$('body').removeClass('dark');
		}
	},

	show: function(view, options) {
		if (view instanceof DialogView) {

			// show modal dialog
			//
			this.showDialog(view, options);
		} else if (!options || !options.full_screen) {

			// show page view
			//
			this.showView(new PageView({
				contentView: view,
				nav: options? options.nav : undefined
			}));
		} else {

			// show main view
			//
			this.showView(new MainView({
				contentView: view,
				nav: options? options.nav : undefined
			}));
		}
	},

	showSpinner: function() {
		$('body').append(this.spinner);
	},

	hideSpinner: function() {
		$('body').find('.spinner.overlay').remove();
	},

	update: function() {

		// clear cache
		//
		this.reset();
				
		// update header
		//
		if (this.getView('body').getChildView('header').currentView) {
			this.getView('body').getChildView('header').currentView.render();
		}
	}
}));