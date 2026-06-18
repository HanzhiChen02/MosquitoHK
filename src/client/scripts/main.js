/******************************************************************************\
|                                                                              |
|                                   main.js                                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application entry point and loading.                 |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../library/jquery/jquery-3.7.1.js';
import '../library/lodash/lodash.js';
import '../library/backbone/backbone.js';
import '../library/backbone/marionette/backbone.marionette.js';
import '../vendor/jquery/mouse-wheel/jquery.mousewheel.js';
import '../vendor/jquery/jquery-ui/jquery-ui.js';
import '../vendor/jquery/fancybox/jquery.fancybox.js';
import '../vendor/leaflet/leaflet.js';
import '../vendor/leaflet/leaflet-hash.js';
import '../vendor/markercluster/leaflet.markercluster.js';
import '../vendor/popper/popper.min.js';

// load configuration files
//
Promise.all([
	fetch('config/config.json?v=' + Date.now()).then(response => response.json()),
	fetch('config/defaults.json?v=' + Date.now()).then(response => response.json()),
]).then(([config, defaults]) => {

	// set web page title
	//
	if (defaults.navbar.title) {
		document.title = defaults.navbar.title;
	}

	function start() {
		$(document).ready(() => {
			import('./application.js').then((Application) => {
				const app = new Application.default({ config, defaults });

				// go!
				//
				$(document).ready(function() {
					app.start();
				});
			});
		});
	}

	start();
});
