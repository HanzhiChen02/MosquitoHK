/******************************************************************************\
|                                                                              |
|                             mosquito-map-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a map view of mosquito observations.                     |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseMapView from '../../views/maps/base-map-view.js';
import DataBarView from '../../views/toolbars/data-bar-view.js';
import ViewBarView from '../../views/toolbars/view-bar-view.js';
import ObservationPopups from '../../views/maps/observation-popups.js';
import MosquitoMarkers from '../../views/maps/mosquito-markers.js';
import TimelineView from '../../views/maps/timeline-view.js';
import QueryString from '../../utilities/web/query-string.js';

export default BaseMapView.extend(_.extend({}, ObservationPopups, MosquitoMarkers, {

	//
	// attributes
	//

	icons: {},

	template: _.template(`
		<div id="map"></div>

		<div id="user-interface" class="full-screen overlay">
			<div id="map-bar"></div>
			<div id="zoom-bar"></div>
			<div id="data-bar"></div>
			<div id="view-bar"></div>
			<div id="timeline-container"></div>
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
		},
		data: {
			el: '#data-bar',
			replaceElement: true
		},
		view: {
			el: '#view-bar',
			replaceElement: true
		},
		timeline: {
			el: '#timeline-container',
			replaceElement: true
		}
	},

	//
	// constructor
	//

	initialize: function() {

		// call superclass constructor
		//
		BaseMapView.prototype.initialize.call(this);

		// set attributes
		//
		this.sources = defaults.sources;
	},

	//
	// ajax methods
	//

	fetchObservations: function(source, options) {

		// compose url
		//
		let url = config.server + '/observations/' + source.replace(/_/g, '-');
		if (options.data) {
			let queryString = QueryString.encode(options.data);
			if (queryString) {
				url += '?' + queryString;
			}
		}

		// fetch data
		//
		fetch(url)
		.then(response => response.json())
		.then(data => {
			if (options && options.success) {
				options.success(data);
			}
		});
	},

	//
	// rendering functions
	//

	onAttach: function() {

		// call superclass method
		//
		BaseMapView.prototype.onAttach.call(this);

		// add markers
		//
		this.update();
	},

	update: function() {
		this.showMarkers();
	},

	//
	// toolbar rendering methods
	//

	showToolbar: function(kind) {
		switch (kind) {
			case 'map':
				this.showMapBar();
				break;
			case 'zoom':
				this.showZoomBar();
				break;
			case 'data':
				this.showDataBar();
				break;
			case 'view':
				this.showViewBar();
				break;
			case 'timeline':
				this.showTimeline();
				break;
		}
	},

	showDataBar: function() {
		this.showChildView('data', new DataBarView({
			parent: this
		}));
	},

	showViewBar: function() {
		this.showChildView('view', new ViewBarView({
			parent: this
		}));
	},

	showTimeline: function() {
		this.showChildView('timeline', new TimelineView({
			parent: this
		}));
	}
}));
