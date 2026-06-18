/******************************************************************************\
|                                                                              |
|                              map-bar-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the toolbar used to control maps.                        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import ToolbarView from './toolbar-view.js';
import QueryString from '../../utilities/web/query-string.js';

export default ToolbarView.extend({

	//
	// attributes
	//

	id: 'map-bar',
	className: 'vertical toolbar',

	template: _.template(`
		<div class="title">Map</div>

		<div class="buttons">
			<button id="map-mode" data-toggle="tooltip" title="Map Mode" data-placement="left">
				<i class="fa fa-compass"></i>
			</button>

			<button id="aerial-mode" data-toggle="tooltip" title="Aerial Mode" data-placement="left">
				<i class="fa fa-plane"></i>
			</button>

			<button id="hybrid-mode" data-toggle="tooltip" title="Hybrid Mode" data-placement="left">
				<i class="fa fa-font"></i>
			</button>

			<button id="colorful-mode" data-toggle="tooltip" title="Colorful Mode" data-placement="left">
				<i class="fa fa-rainbow"></i>
			</button>

			<button id="dark-mode" data-toggle="tooltip" title="Dark Mode" data-placement="left">
				<i class="fa fa-circle-half-stroke"></i>
			</button>

			<button id="show-markers" data-toggle="tooltip" title="Show Markers" data-placement="left">
				<i class="fa fa-map-marker"></i>
			</button>
		</div>
	`),

	events: {
		'click #map-mode': 'onClickMapMode',
		'click #aerial-mode': 'onClickAerialMode',
		'click #hybrid-mode': 'onClickHybridMode',
		'click #colorful-mode': 'onClickColorfulMode',
		'click #dark-mode': 'onClickDarkMode',
		'click #show-markers': 'onClickShowMarkers',
	},

	//
	// querying methods
	//

	isButtonSelected: function(name) {
		return this.$el.find('#' + name).hasClass('selected');
	},

	//
	// getting methods
	//

	getMapMode: function() {
		if (this.$el.find('#show-map-mode').hasClass('selected')) {
			return 'map';
		} else if (this.$el.find('#aerial-mode').hasClass('selected')) {
			return 'aerial';
		} else if (this.$el.find('#hybrid-mode').hasClass('selected')) {
			return 'hybrid';
		}
	},

	getQueryParams: function() {
		let params = new URLSearchParams();
		this.addQueryParams(params);
		return params;
	},

	//
	// setting methods
	//

	setMapButtonMode: function(mapMode) {
		switch (mapMode) {
			case 'map':
				this.selectButton('map-mode');
				this.deselectButton('aerial-mode');
				this.deselectButton('hybrid-mode');
				break;
			case 'aerial':
				this.deselectButton('map-mode');
				this.selectButton('aerial-mode');
				this.deselectButton('hybrid-mode');
				break;
			case 'hybrid':
				this.deselectButton('map-mode');
				this.deselectButton('aerial-mode');
				this.selectButton('hybrid-mode');
				break;
		}
	},

	setMapMode: function(mapMode) {

		// set button states
		//
		this.setMapButtonMode(mapMode);

		// update map
		//
		this.parent.setMapMode(mapMode);
	},

	setQueryParams: function(params) {
		if (params.mode) {
			this.setMapMode(params.mode);
		}
	},

	setMode: function(mapMode) {
		if (this.getMapMode() !== mapMode) {
			this.setMapMode(mapMode);
		}
	},

	setShowMarkers: function(showMarkers) {
		if (showMarkers) {
			$('body').removeClass('hide-markers');
		} else {
			$('body').addClass('hide-markers');
		}
	},

	setShowColors: function(showColors) {
		if (showColors) {
			$('body').addClass('colorful');
		} else {
			$('body').removeClass('colorful');
		}
	},

	setDarkMode: function(darkMode) {
		if (darkMode) {
			$('body').addClass('dark');
		} else {
			$('body').removeClass('dark');
		}
	},

	//
	// button toggle methods
	//

	toggleColorfulMode: function() {
		if (!this.isButtonSelected('colorful-mode')) {
			this.selectButton('colorful-mode');
			this.setShowColors(true);
		} else {
			this.deselectButton('colorful-mode');
			this.setShowColors(false);
		}
	},

	toggleDarkMode: function() {
		if (!this.isButtonSelected('dark-mode')) {
			this.selectButton('dark-mode');
			this.setDarkMode(true);
		} else {
			this.deselectButton('dark-mode');
			this.setDarkMode(false);
		}
	},

	toggleShowMarkers: function() {
		if (!this.isButtonSelected('show-markers')) {
			this.selectButton('show-markers');
			this.setShowMarkers(true);
		} else {
			this.deselectButton('show-markers');
			this.setShowMarkers(false);
		}
	},

	//
	// selection methods
	//

	selectButton: function(name) {
		this.$el.find('#' + name).addClass('selected');
	},

	deselectButton: function(name) {
		this.$el.find('#' + name).removeClass('selected');
	},

	//
	// query string methods
	//

	updateQueryString: function() {
		let mapMode = this.getMapMode();

		if (mapMode !== 'map') {
			QueryString.add('mode', mapMode);
		} else {
			QueryString.remove('mode');
		}

		if (this.isButtonSelected('colorful-mode')) {
			QueryString.add('colorful', true);
		} else {
			QueryString.remove('colorful');
		}

		if (this.isButtonSelected('dark-mode')) {
			QueryString.add('dark', true);
		} else {
			QueryString.remove('dark');
		}

		if (this.isButtonSelected('show-markers')) {
			QueryString.remove('markers');
		} else {
			QueryString.add('markers', false);
		}

		/*
		// add query to params
		//
		let params = QueryString.toObject();

		// update map mode
		//
		if (mapMode != 'map') {
			params.mode = mapMode;
		} else {
			delete params.mode;
		}

		// set address bar
		//
		QueryString.set(QueryString.encode(params));
		*/
	},

	addQueryParams: function(params) {
		let mode = this.getMapMode();
		if (mode !== 'map') {
			params.set('mode', mode);
		}
		return params;
	},

	//
	// rendering methods
	//

	onRender: function() {

		// call superclass method
		//
		ToolbarView.prototype.onRender.call(this);

		// set initial mode
		//
		this.setMapButtonMode(QueryString.value('mode') || defaults.map.mode);

		// set initial marker visibility
		//
		if (QueryString.value('markers') !== 'false') {
			this.toggleShowMarkers();
		} else {
			this.setShowMarkers(false);
		}

		// set initial colors
		//
		if (QueryString.value('colorful')) {
			this.toggleColorfulMode();
		}
		if (QueryString.value('dark')) {
			this.selectButton('dark-mode');
		}
	},

	//
	// mouse event handling methods
	//

	onClickMapMode: function() {
		this.setMode('map');
		this.updateQueryString();
	},

	onClickAerialMode: function() {
		this.setMode('aerial');
		this.updateQueryString();
	},

	onClickHybridMode: function() {
		this.setMode('hybrid');
		this.updateQueryString();
	},

	onClickColorfulMode: function() {
		this.toggleColorfulMode();
		this.updateQueryString();
	},

	onClickDarkMode: function() {
		this.toggleDarkMode();
		this.updateQueryString();
	},

	onClickShowMarkers: function() {
		this.toggleShowMarkers();
		this.updateQueryString();
	}
});