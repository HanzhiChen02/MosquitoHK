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
import LandscapeTimelineView from '../../views/maps/landscape-timeline-view.js';
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
			<div id="panel-switcher">
				<button class="panel-mode selected" data-panel="mosquito">
					<i class="fa fa-bug"></i>
					<span>Mosquito</span>
				</button>
				<button class="panel-mode" data-panel="environment">
					<i class="fa fa-cloud-sun"></i>
					<span>Environment</span>
				</button>
				<button class="panel-mode" data-panel="landscape">
					<i class="fa fa-mountain-sun"></i>
					<span>Landscape</span>
				</button>
			</div>
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
			<div id="environment-panel">
				<div class="title">Environment</div>
				<button class="environment-metric selected" data-metric="mean_temperature" title="Mean temperature">
					<i class="fa fa-temperature-half"></i>
					<span>Temp</span>
				</button>
				<button class="environment-metric" data-metric="total_rainfall" title="Total rainfall">
					<i class="fa fa-cloud-rain"></i>
					<span>Rain</span>
				</button>
				<button class="environment-metric" data-metric="mean_relative_humidity" title="Mean relative humidity">
					<i class="fa fa-droplet"></i>
					<span>RH</span>
				</button>
			</div>
			<div id="environment-index">
				<div class="title">Mean Temperature</div>
				<div><span class="swatch env-level-1"></span> Cool: &lt; 18°C</div>
				<div><span class="swatch env-level-2"></span> Mild: 18 - &lt; 26°C</div>
				<div><span class="swatch env-level-3"></span> Warm: 26 - &lt; 30°C</div>
				<div><span class="swatch env-level-4"></span> Hot: ≥ 30°C</div>
			</div>
			<div id="landscape-panel">
				<div class="title">Landscape</div>
				<div class="landscape-year">
					<i class="fa fa-calendar"></i>
					<span>2023</span>
				</div>
				<div class="landscape-summary">
					<div>Built-up: <strong class="built-up-area">—</strong> km²</div>
					<div>Other land: <strong class="other-area">—</strong> km²</div>
				</div>
				<label for="landscape-opacity">Opacity</label>
				<input id="landscape-opacity" type="range" min="20" max="100" value="78" step="1">
				<a href="https://www.pland.gov.hk/pland_tc/info_serv/open_data/landu/" target="_blank" rel="noopener">
					Planning Department
				</a>
			</div>
			<div id="landscape-index">
				<div class="title">Land-use classes / 土地用途分類</div>
				<div class="landscape-legend-rows"></div>
				<div class="landscape-warning">
					Year-to-year comparison is indicative because definitions and methodology may change.
				</div>
			</div>
			<div id="timeline-container"></div>
			<div id="fehd-point-timeline-container"></div>
			<div id="fehd-area-timeline-container"></div>
			<div id="environment-timeline-container"></div>
			<div id="landscape-timeline-container"></div>
		</div>
	`),

	events: {
		'click #panel-switcher .panel-mode': 'onClickPanelMode',
		'click #environment-panel .environment-metric': 'onClickEnvironmentMetric',
		'input #landscape-opacity': 'onChangeLandscapeOpacity'
	},

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
		fehdPointTimeline: {
			el: '#fehd-point-timeline-container',
			replaceElement: true
		},
		fehdAreaTimeline: {
			el: '#fehd-area-timeline-container',
			replaceElement: true
		},
		environmentTimeline: {
			el: '#environment-timeline-container',
			replaceElement: true
		},
		landscapeTimeline: {
			el: '#landscape-timeline-container',
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
		this.landscapeOpacity = parseInt(QueryString.value('landscape_opacity')) || 78;
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
		this.updateEnvironmentPanel();
		this.updateLandscapePanel();
		this.updatePanelVisibility();

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
		if (this.hasChildView && this.hasChildView('fehdPointTimeline')) {
			this.getChildView('fehdPointTimeline').update();
		}
		if (this.hasChildView && this.hasChildView('fehdAreaTimeline')) {
			this.getChildView('fehdAreaTimeline').update();
		}
		if (this.hasChildView && this.hasChildView('environmentTimeline')) {
			this.getChildView('environmentTimeline').update();
		}
		this.updateTimelineVisibility();
	},

	isDataSourceSelected: function(source) {
		if (this.hasChildView && this.hasChildView('data')) {
			return this.getChildView('data').isDataSourceSelected(source);
		}
		return $('#data-bar .' + source).hasClass('selected');
	},

	getActivePanel: function() {
		let panel = QueryString.value('panel') || 'mosquito';
		return ['mosquito', 'environment', 'landscape'].includes(panel)?
			panel :
			'mosquito';
	},

	isEnvironmentPanelActive: function() {
		return this.getActivePanel() === 'environment';
	},

	isMosquitoPanelActive: function() {
		return this.getActivePanel() === 'mosquito';
	},

	isLandscapePanelActive: function() {
		return this.getActivePanel() === 'landscape';
	},

	setActivePanel: function(panel) {
		QueryString.add('panel', panel);
		this.updatePanelVisibility();
		this.update();
	},

	updatePanelVisibility: function() {
		let environmentActive = this.isEnvironmentPanelActive();
		let landscapeActive = this.isLandscapePanelActive();
		let mosquitoActive = this.isMosquitoPanelActive();
		let inatSelected = this.isDataSourceSelected('inaturalist');
		let fehdSelected = this.isDataSourceSelected('fehd_gravidtrap');
		let agiSelected = this.isDataSourceSelected('fehd_gravidtrap_area');
		let allMosquitoSelected = inatSelected && fehdSelected && agiSelected;

		this.$el.find('#panel-switcher .panel-mode').removeClass('selected');
		this.$el.find('#panel-switcher .panel-mode[data-panel="' + this.getActivePanel() + '"]').addClass('selected');

		this.$el.find('#data-bar').toggle(mosquitoActive);
		this.$el.find('#environment-panel').toggle(environmentActive);
		this.$el.find('#environment-index').toggle(environmentActive);
		this.$el.find('#landscape-panel').toggle(landscapeActive);
		this.$el.find('#landscape-index').toggle(landscapeActive);
		this.$el.find('#timeline').toggle(mosquitoActive && inatSelected);
		this.$el.find('#fehd-point-timeline').toggle(mosquitoActive && fehdSelected && !allMosquitoSelected);
		this.$el.find('#fehd-area-timeline').toggle(mosquitoActive && agiSelected);
		this.$el.find('#environment-timeline').toggle(environmentActive);
		this.$el.find('#landscape-timeline').toggle(landscapeActive);
		this.updateVisibleTimelinePositions();

		let fehdVisible = mosquitoActive && (
			this.isDataSourceSelected('fehd_gravidtrap') ||
			this.isDataSourceSelected('fehd_gravidtrap_area')
		);
		this.$el.find('#fehd-index-legend').toggle(fehdVisible);

		if (landscapeActive) {
			this.showLandscapeLayer(this.getLandscapeYear());
		} else {
			this.removeLandscapeLayer();
		}
	},

	updateTimelineVisibility: function() {
		this.updatePanelVisibility();
	},

	updateVisibleTimelinePositions: function() {
		let ids = [
			'#timeline',
			'#fehd-point-timeline',
			'#fehd-area-timeline',
			'#environment-timeline',
			'#landscape-timeline'
		];
		let visible = [];
		for (let i = 0; i < ids.length; i++) {
			let $timeline = this.$el.find(ids[i]);
			if ($timeline.length && $timeline.is(':visible')) {
				visible.push($timeline);
			}
		}

		for (let i = 0; i < visible.length; i++) {
			let bottom = (window.innerWidth <= 640? 8 : 16) + i * (window.innerWidth <= 640? 108 : 108);
			visible[i].css('bottom', bottom + 'px');
		}
	},

	syncTimelinePeriod: function(sourceTimeline, index) {
		let prefix = sourceTimeline.options && sourceTimeline.options.dateParamPrefix;
		if (!prefix) {
			return;
		}

		let regions = [
			'timeline',
			'fehdPointTimeline',
			'fehdAreaTimeline',
			'environmentTimeline'
		];

		for (let i = 0; i < regions.length; i++) {
			if (!this.hasChildView || !this.hasChildView(regions[i])) {
				continue;
			}
			let timeline = this.getChildView(regions[i]);
			if (timeline === sourceTimeline) {
				continue;
			}
			if (!timeline.options || timeline.options.dateParamPrefix !== prefix) {
				continue;
			}
			timeline.$el.find('.timeline-slider').val(index);
			timeline.showPeriod(index);
		}
	},

	getEnvironmentMetric: function() {
		return QueryString.value('environment_metric') || 'mean_temperature';
	},

	setEnvironmentMetric: function(metric) {
		QueryString.add('environment_metric', metric);
		if (!this.isEnvironmentPanelActive()) {
			QueryString.add('panel', 'environment');
		}
		this.updateEnvironmentPanel();
		this.updateEnvironmentIndex();
		this.updatePanelVisibility();
		this.showMarkers();
		this.updateTimeline();
	},

	updateEnvironmentPanel: function() {
		let metric = this.getEnvironmentMetric();
		this.$el.find('#environment-panel .environment-metric').removeClass('selected');
		this.$el.find('#environment-panel .environment-metric[data-metric="' + metric + '"]').addClass('selected');
		this.updateEnvironmentIndex();
	},

	updateEnvironmentIndex: function() {
		let metric = this.getEnvironmentMetric();
		let index = {
			mean_temperature: {
				title: 'Mean Temperature',
				rows: ['Cool: < 18°C', 'Mild: 18 - < 26°C', 'Warm: 26 - < 30°C', 'Hot: ≥ 30°C']
			},
			total_rainfall: {
				title: 'Total Rainfall',
				rows: ['None: 0 mm', 'Light: > 0 - < 10 mm', 'Moderate: 10 - < 50 mm', 'Heavy: ≥ 50 mm']
			},
			mean_relative_humidity: {
				title: 'Mean Relative Humidity',
				rows: ['Dry: < 60%', 'Comfort: 60 - < 75%', 'Humid: 75 - < 90%', 'Very humid: ≥ 90%']
			}
		}[metric];
		let html = '<div class="title">' + index.title + '</div>';
		for (let i = 0; i < index.rows.length; i++) {
			html += '<div><span class="swatch env-level-' + (i + 1) + '"></span> ' + index.rows[i] + '</div>';
		}
		this.$el.find('#environment-index').html(html);
	},

	getLandscapeManifest: function() {
		if (!this.landscapeManifestPromise) {
			this.landscapeManifestPromise = fetch('data/landscape/web/manifest.json')
			.then(response => {
				if (!response.ok) {
					throw new Error('Could not load landscape manifest.');
				}
				return response.json();
			})
			.then(manifest => {
				this.landscapeManifest = manifest;
				this.renderLandscapeLegend();
				this.updateLandscapeSummary(this.getLandscapeYear());
				return manifest;
			});
		}
		return this.landscapeManifestPromise;
	},

	getLandscapeYear: function() {
		let year = parseInt(QueryString.value('landscape_year'));
		return year >= 2018 && year <= 2023? year : 2023;
	},

	getLandscapeEntry: function(year) {
		if (!this.landscapeManifest) {
			return null;
		}
		return this.landscapeManifest.years.find(item => item.year === year);
	},

	previewLandscapeYear: function(year) {
		this.$el.find('#landscape-panel .landscape-year span').text(year);
		this.updateLandscapeSummary(year);
		if (this.isLandscapePanelActive()) {
			this.showLandscapeLayer(year);
		}
	},

	setLandscapeYear: function(year) {
		QueryString.add('landscape_year', year);
		this.previewLandscapeYear(year);
	},

	setLandscapeOpacity: function(opacity) {
		this.landscapeOpacity = opacity;
		QueryString.add('landscape_opacity', opacity);
		if (this.landscapeLayer) {
			this.landscapeLayer.setOpacity(opacity / 100);
		}
	},

	updateLandscapePanel: function() {
		this.$el.find('#landscape-panel .landscape-year span').text(this.getLandscapeYear());
		this.$el.find('#landscape-opacity').val(this.landscapeOpacity);
		this.getLandscapeManifest();
	},

	renderLandscapeLegend: function() {
		if (!this.landscapeManifest) {
			return;
		}
		let html = '';
		for (let i = 0; i < this.landscapeManifest.classes.length; i++) {
			let item = this.landscapeManifest.classes[i];
			html += '<div class="landscape-legend-row">' +
				'<span class="landscape-swatch" style="background:' + item.color + '"></span>' +
				'<span><strong>' + item.code + '</strong> ' + item.name +
				'<small>' + item.name_zh + '</small></span>' +
				'</div>';
		}
		this.$el.find('#landscape-index .landscape-legend-rows').html(html);
	},

	updateLandscapeSummary: function(year) {
		let entry = this.getLandscapeEntry(year);
		if (!entry) {
			return;
		}
		let builtUpGroups = [
			'Residential',
			'Commercial',
			'Industrial',
			'Institutional / Open Space',
			'Transportation',
			'Other Urban or Built-up Land'
		];
		let builtUp = 0;
		let other = 0;
		for (let i = 0; i < entry.statistics.length; i++) {
			let item = entry.statistics[i];
			if (builtUpGroups.includes(item.group)) {
				builtUp += item.area_km2 || 0;
			} else {
				other += item.area_km2 || 0;
			}
		}
		this.$el.find('#landscape-panel .built-up-area').text(builtUp);
		this.$el.find('#landscape-panel .other-area').text(other);
	},

	showLandscapeLayer: function(year) {
		this.getLandscapeManifest().then(() => {
			let entry = this.getLandscapeEntry(year);
			if (!entry || !this.map || !this.isLandscapePanelActive()) {
				return;
			}
			if (this.landscapeLayer && this.landscapeLayerYear === year) {
				this.landscapeLayer.setOpacity(this.landscapeOpacity / 100);
				return;
			}
			this.removeLandscapeLayer();
			this.landscapeLayer = L.imageOverlay(
				'data/landscape/web/' + entry.image,
				entry.bounds,
				{
					opacity: this.landscapeOpacity / 100,
					interactive: false,
					className: 'landscape-image-layer'
				}
			).addTo(this.map);
			this.landscapeLayer.bringToBack();
			this.landscapeLayerYear = year;
		});
	},

	removeLandscapeLayer: function() {
		if (this.landscapeLayer && this.map) {
			this.map.removeLayer(this.landscapeLayer);
		}
		this.landscapeLayer = null;
		this.landscapeLayerYear = null;
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
			parent: this,
			id: 'timeline',
			source: 'inaturalist',
			title: 'iNaturalist timeline / iNaturalist 時間軸'
		}));
		this.showChildView('fehdPointTimeline', new TimelineView({
			parent: this,
			id: 'fehd-point-timeline',
			source: 'fehd_gravidtrap',
			title: 'FEHD point timeline / 食環署監察點時間軸',
			dateParamPrefix: 'fehd'
		}));
		this.showChildView('fehdAreaTimeline', new TimelineView({
			parent: this,
			id: 'fehd-area-timeline',
			source: 'fehd_gravidtrap_area',
			title: 'FEHD district fill timeline / 分區填色時間軸',
			dateParamPrefix: 'fehd'
		}));
		this.showChildView('environmentTimeline', new TimelineView({
			parent: this,
			id: 'environment-timeline',
			source: 'environment_hko',
			title: 'Environment daily timeline / 每日環境時間軸',
			dateParamPrefix: 'env'
		}));
		this.showChildView('landscapeTimeline', new LandscapeTimelineView({
			parent: this
		}));
		this.updateTimelineVisibility();
	},

	onClickEnvironmentMetric: function(event) {
		let metric = $(event.currentTarget).attr('data-metric');
		this.setEnvironmentMetric(metric);
	},

	onChangeLandscapeOpacity: function(event) {
		this.setLandscapeOpacity(parseInt($(event.currentTarget).val()));
	},

	onClickPanelMode: function(event) {
		let panel = $(event.currentTarget).attr('data-panel');
		this.setActivePanel(panel);
	}
}));
