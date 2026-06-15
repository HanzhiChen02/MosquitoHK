/******************************************************************************\
|                                                                              |
|                             base-map-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a basic map view.                                        |
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
import MapBarView from '../../views/toolbars/map-bar-view.js';
import ZoomBarView from '../../views/toolbars/zoom-bar-view.js';
import FullScreenable from '../../views/behaviors/layout/full-screenable.js';
import QueryString from '../../utilities/web/query-string.js';

export default BaseView.extend(_.extend({}, FullScreenable, {

	//
	// attributes
	//

	baseMaps: {
		map: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}),
		aerial: L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
			subdomains:['mt0','mt1','mt2','mt3']
		}),
		hybrid: L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
			subdomains:['mt0','mt1','mt2','mt3']
		})
	},

	template: _.template(`
		<div id="map"></div>

		<div id="user-interface">
			<div id="map-bar"></div>
			<div id="zoom-bar"></div>
		</div>
	`),

	regions: {
		map: {
			el: '#map-bar',
			replaceElement: true
		},
		zoom: {
			el: '#zoom-bar',
			replaceElement: true
		}
	},

	mode: undefined,

	//
	// constructor
	//

	initialize: function() {
		let latitude = parseFloat(QueryString.value('lat'));
		let longitude = parseFloat(QueryString.value('lng'));

		// wrap longitude to 0 - 360 range
		//
		while (longitude < 0) {
			longitude += 360;
		}
		while (longitude > 180) {
			longitude -= 360;
		}

		// set initial map mode
		//
		this.mode = QueryString.value('mode') || defaults.map.mode;
		this.zoomLevel = QueryString.value('zoom') || defaults.map.zoom;
		this.center = latitude && longitude? [latitude, longitude]: defaults.map.center;
	},

	//
	// getting methods
	//

	getMapMode: function() {
		return this.mode;
	},

	getZoomLevel: function() {
		return this.map.getZoom();
	},

	//
	// setting methods
	//

	setMapMode: function(mode) {
		if (this.baseLayer) {
			this.map.removeLayer(this.baseLayer);
		}
		this.baseLayer = this.baseMaps[mode];
		this.baseLayer.addTo(this.map);

		// set map class
		//
		let mapElement = this.$el.find('#map');
		switch (mode) {
			case 'map':
				mapElement.removeClass('aerial');
				mapElement.removeClass('hybrid');
				break;
			case 'aerial':
				mapElement.addClass('aerial');
				mapElement.removeClass('hybrid');
				break;
			case 'hybrid':
				mapElement.removeClass('aerial');
				mapElement.addClass('hybrid');
				break;
		}
	},

	setZoomLevel: function(zoomLevel) {
		this.map.setZoom(zoomLevel);
	},

	//
	// zooming methodsd
	//

	zoomIn: function() {
		this.setZoomLevel(this.getZoomLevel() + 1);
	},

	zoomOut: function() {
		this.setZoomLevel(this.getZoomLevel() - 1);
	},

	//
	// rendering methods
	//

	onAttach: function() {
		this.showBaseMap();
		this.showRegionBoundary();
		this.showToolbars();

		this.map.on('zoom', () => {
			this.onZoom();
		});
	},

	showBaseMap: function() {
		this.map = L.map('map', defaults.leaflet).setView(this.center, this.zoomLevel);

		// add base map
		//
		this.setMapMode(this.mode);

		// record current map location
		//
		this.addMapDragCallback();
	},

	showRegionBoundary: function() {
		if (!defaults.map.boundary) {
			return;
		}

		fetch(defaults.map.boundary)
		.then(response => response.json())
		.then(boundary => {
			L.geoJSON(boundary, {
				style: {
					color: '#e40046',
					weight: 2,
					opacity: 0.8,
					fillOpacity: 0.02
				},
				interactive: false
			}).addTo(this.map);
		});
	},

	addMapDragCallback: function() {
		this.map.on('dragend', () => {
			this.onPan();
		});
	},

	//
	// toolbar rendering methods
	//

	showToolbars: function() {
		let toolbars = Object.keys(this.regions);
		for (let i = 0; i < toolbars.length; i++) {
			this.showToolbar(toolbars[i]);
		}
	},

	showToolbar: function(kind) {
		switch (kind) {
			case 'map':
				this.showMapBar();
				break;
			case 'zoom':
				this.showZoomBar();
				break;
		}
	},

	showMapBar: function() {
		this.showChildView('map', new MapBarView({
			parent: this
		}));
	},

	showZoomBar: function() {
		this.showChildView('zoom', new ZoomBarView({
			zoomLevel: this.zoomLevel,
			parent: this
		}));
	},

	//
	// event handling methods
	//

	onPan: function() {

		// update query string
		//
		let center = this.map.getCenter();

		// wrap coords to range
		//
		while (center.lng < 0) {
			center.lng += 360;
		}
		while (center.lng > 180) {
			center.lng -= 360;
		}

		QueryString.add({
			lat: center.lat,
			lng: center.lng
		});
	},

	onZoom: function() {

		// update query string
		//
		QueryString.add({
			zoom: this.getZoomLevel()
		});

		// update zoom bar
		//
		this.getChildView('zoom').setZoomLevel(this.getZoomLevel());
	},

	//
	// cleanup methods
	//

	onBeforeDestroy: function() {
		if (this.map && this.map.remove) {
			this.map.off();
			this.map.remove();
			this.map = null;
		}
	}
}));
