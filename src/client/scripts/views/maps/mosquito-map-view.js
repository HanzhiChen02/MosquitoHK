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
			<div id="fehd-index-legend">
				<div class="title">FEHD AGI Index</div>
				<div><span class="swatch level-1"></span> Level I: &lt; 5%</div>
				<div><span class="swatch level-2"></span> Level II: 5% - &lt; 20%</div>
				<div><span class="swatch level-3"></span> Level III: 20% - &lt; 40%</div>
				<div><span class="swatch level-4"></span> Level IV: ≥ 40%</div>
				<div><span class="swatch level-unknown"></span> No AGI yet</div>
			</div>
			<div id="view-bar"></div>
			<div id="timeline-container"></div>
			<div id="fehd-area-timeline-container"></div>
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
		},
		fehdAreaTimeline: {
			el: '#fehd-area-timeline-container',
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

		// initialize draggable panels
		//
		this.enableDraggableLegend();

		// add markers
		//
		this.update();
	},

	enableDraggableLegend: function() {
		let $legend = this.$el.find('#fehd-index-legend');
		if (!$legend.length || $legend.data('draggable')) {
			return;
		}
		$legend.data('draggable', true);

		let isDragging = false;
		let offset = {
			x: 0,
			y: 0
		};

		let clamp = (value, min, max) => Math.max(min, Math.min(max, value));
		let moveLegend = (event) => {
			if (!isDragging) {
				return;
			}

			let pointer = event.originalEvent && event.originalEvent.touches?
				event.originalEvent.touches[0] :
				event;
			let width = $legend.outerWidth();
			let height = $legend.outerHeight();
			let left = clamp(pointer.clientX - offset.x, 8, window.innerWidth - width - 8);
			let top = clamp(pointer.clientY - offset.y, 8, window.innerHeight - height - 8);

			$legend.css({
				left: left + 'px',
				top: top + 'px',
				bottom: 'auto',
				transform: 'none'
			});
		};
		let stopDragging = () => {
			isDragging = false;
			$(document).off('.fehdLegendDrag');
		};

		$legend.on('mousedown touchstart', (event) => {
			let pointer = event.originalEvent && event.originalEvent.touches?
				event.originalEvent.touches[0] :
				event;
			let rect = $legend[0].getBoundingClientRect();

			isDragging = true;
			offset = {
				x: pointer.clientX - rect.left,
				y: pointer.clientY - rect.top
			};

			$(document)
			.on('mousemove.fehdLegendDrag touchmove.fehdLegendDrag', moveLegend)
			.on('mouseup.fehdLegendDrag touchend.fehdLegendDrag touchcancel.fehdLegendDrag', stopDragging);

			event.preventDefault();
			event.stopPropagation();
		});
	},

	update: function() {
		this.showMarkers();
		this.updateTimeline();
	},

	updateTimeline: function() {
		if (this.hasChildView && this.hasChildView('timeline')) {
			this.getChildView('timeline').update();
		}
		if (this.hasChildView && this.hasChildView('fehdAreaTimeline')) {
			this.getChildView('fehdAreaTimeline').update();
		}
		this.updateTimelineVisibility();
	},

	isDataSourceSelected: function(source) {
		if (this.hasChildView && this.hasChildView('data')) {
			return this.getChildView('data').isDataSourceSelected(source);
		}
		return $('#data-bar .' + source).hasClass('selected');
	},

	updateTimelineVisibility: function() {
		this.$el.find('#fehd-area-timeline').toggle(
			this.isDataSourceSelected('fehd_gravidtrap_area')
		);
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
		this.showChildView('fehdAreaTimeline', new TimelineView({
			parent: this,
			id: 'fehd-area-timeline',
			source: 'fehd_gravidtrap_area',
			title: 'FEHD district fill timeline / 分區填色時間軸',
			dateParamPrefix: 'fehd_area'
		}));
		this.updateTimelineVisibility();
	}
}));
