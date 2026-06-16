/******************************************************************************\
|                                                                              |
|                              mosquito-markers.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a mixin for adding mosquito markers to a map.            |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Browser from '../../utilities/web/browser.js';
import QueryString from '../../utilities/web/query-string.js';

export default {

	//
	// mapping functions
	//

	getClusterGroup: function(source) {
		return L.markerClusterGroup({
			options: Object.assign(L.MarkerClusterGroup.prototype.options, defaults.clustering),

			iconCreateFunction: function (cluster) {
				const markers = cluster.getAllChildMarkers();
				const numMarkers = markers.length;
				const iconSize = Math.trunc(15 + Math.log10(numMarkers) * 6);

				return new L.DivIcon({
					html: `<div>${numMarkers}</div>`,
					className: source.replace(/_/g, '-') + ' cluster',
					iconSize: new L.Point(iconSize, iconSize)
				});
			}
		});
	},

	getClusterGroups: function(sources) {
		let clusterGroups = {};
		for (let i = 0; i < sources.length; i++) {
			let source = sources[i];
			clusterGroups[source] = this.getClusterGroup(source);
		}
		return clusterGroups;
	},

	addMapMarker: function(map, source, observation, selected) {

		// get marker icon
		//
		if (!this.icons[source]) {
			this.icons[source] = new L.DivIcon({
				html: `<div></div>`,
				className: source.replace(/_/g, '-') + ' marker',
				iconSize: Browser.is_mobile? defaults.map.markerSize.mobile : defaults.map.markerSize.desktop
			});
		}
		let icon = this.icons[source];

		// create marker
		//
		let marker = L.marker([observation.y, observation.x], {
			icon: icon,
			source: source,
			id: observation.id
		});

		// save reference to marker
		//
		this.markers[observation.id] = marker;

		// add marker popup on click
		//
		marker.on('click', () => {
			this.addObservationPopup(marker);
		});

		// show selected marker
		//
		if (observation.id === selected) {
			this.addObservationPopup(marker);
		}

		// add marker to map
		//
		marker.addTo(map);
	},

	addMapMarkers: function(map, source, observations, selected) {
		for (let i = 0; i < observations.length; i++) {
			this.addMapMarker(map, source, observations[i], selected);
		}
	},

	addClusteredMarker: function(clusterGroup, source, observation, selected) {
		if (observation.x && observation.y) {
			let radius = Browser.is_mobile? defaults.map.markerSize.mobile / 2: defaults.map.markerSize.desktop / 2;
			let markerClass = source.replace(/_/g, '-') + ' marker';
			let indexLevel = null;
			let indexColor = null;

			if (source === 'fehd_gravidtrap') {
				indexLevel = this.getFehdIndexLevel(observation.agi_percent);
				indexColor = this.getFehdIndexColor(indexLevel);
				markerClass += ' ' + indexLevel;
				radius *= 1.5;
			}

			// highlight single mosquito observation with additional data
			//
			if (observation.id == 'b9e9cbc7-2983-41d7-a041-59d42c50ee8e') {
				radius *= 2;
			}

			let marker = L.circleMarker([observation.y, observation.x], {
				source: source,
				id: observation.id,
				radius: radius,
				className: markerClass,
				fillColor: indexColor || undefined,
				color: indexColor? '#ffffff' : undefined,
			});

			if (indexLevel) {
				marker.on('add', () => {
					if (marker._path) {
						$(marker._path).addClass(indexLevel);
					}
				});
			}

			// save reference to marker
			//
			this.markers[observation.id] = marker;

			// add marker popup on click
			//
			marker.on('click', () => {
				this.addObservationPopup(marker);
			});

			// show selected marker
			//
			if (observation.id === selected) {
				this.addObservationPopup(marker);
			}

			// add marker to cluster
			//
			clusterGroup.addLayer(marker);
		}
	},

	getFehdIndexLevel: function(value) {
		let index = parseFloat(value);
		if (isNaN(index)) {
			return 'level-unknown';
		}
		if (index < 5) {
			return 'level-1';
		}
		if (index < 20) {
			return 'level-2';
		}
		if (index < 40) {
			return 'level-3';
		}
		return 'level-4';
	},

	getFehdIndexColor: function(level) {
		switch (level) {
			case 'level-1':
				return '#2fa84f';
			case 'level-2':
				return '#f2c94c';
			case 'level-3':
				return '#eb5757';
			case 'level-4':
				return '#7b2cbf';
			default:
				return '#9ca3af';
		}
	},

	locationInBounds(location, bounds) {
		if (bounds.lat) {
			if (location.y < bounds.lat.min || location.y > bounds.lat.max) {
				return false;
			}
		}
		if (bounds.lon) {
			if (location.x < bounds.lon.min || location.x > bounds.lon.max) {
				return false;
			}
		}
		return true;
	},

	addClusteredMarkers: function(map, source, observations, selected) {

		// create new cluster group, if necessary
		//
		if (!this.clusterGroups) {
			this.clusterGroups = this.getClusterGroups(this.sources);
		}
		let clusterGroup = this.clusterGroups[source];

		for (let i = 0; i < observations.length; i++) {
			let observation = observations[i];
			if (defaults.map.bounds) {
				if (this.locationInBounds(observation, defaults.map.bounds)) {
					this.addClusteredMarker(clusterGroup, source, observations[i], selected);
				}
			} else {
				this.addClusteredMarker(clusterGroup, source, observations[i], selected);
			}
		}

		// add cluster to map
		//
		map.addLayer(clusterGroup);

		return clusterGroup;
	},

	removeMarkers: function() {
		if (this.clusterGroups) {
			for (const source in this.clusterGroups) {
				let clusterGroup = this.clusterGroups[source];
				clusterGroup.clearLayers();
				this.map.removeLayer(clusterGroup);
			}
		}

		if (this.areaLayers) {
			for (const source in this.areaLayers) {
				this.map.removeLayer(this.areaLayers[source]);
			}
			this.areaLayers = {};
		}
	},

	nextRequestId: function(source) {
		if (!this.requestIds) {
			this.requestIds = {};
		}
		this.requestIds[source] = (this.requestIds[source] || 0) + 1;
		return this.requestIds[source];
	},

	isCurrentRequest: function(source, requestId) {
		return this.requestIds && this.requestIds[source] === requestId;
	},

	showDataSource: function(dataSource) {
		this.$el.find('#map').removeClass('hide-' + dataSource);
		if (dataSource === 'fehd_gravidtrap' || dataSource === 'fehd_gravidtrap_area') {
			this.$el.find('#fehd-index-legend').show();
		}
		if (this.updateTimelineVisibility) {
			this.updateTimelineVisibility();
		}
	},

	hideDataSource: function(dataSource) {
		this.$el.find('#map').addClass('hide-' + dataSource);
		let fehdPointVisible = this.$el.find('#data-bar .fehd_gravidtrap').hasClass('selected');
		let fehdAreaVisible = this.$el.find('#data-bar .fehd_gravidtrap_area').hasClass('selected');
		if ((dataSource === 'fehd_gravidtrap' || dataSource === 'fehd_gravidtrap_area') && !fehdPointVisible && !fehdAreaVisible) {
			this.$el.find('#fehd-index-legend').hide();
		}
		if (this.updateTimelineVisibility) {
			this.updateTimelineVisibility();
		}
	},

	//
	// rendering functions
	//


	fetchFehdAreaObservations: function(options) {
		let url = config.server + '/observations/fehd-gravidtrap/areas';
		if (options.data) {
			let queryString = QueryString.encode(options.data);
			if (queryString) {
				url += '?' + queryString;
			}
		}

		fetch(url)
		.then(response => response.json())
		.then(data => {
			if (options && options.success) {
				options.success(data);
			}
		});
	},

	getFehdAreaStyle: function(feature) {
		let agi = feature.properties.average_agi_percent;
		let level = this.getFehdIndexLevel(agi);
		let color = this.getFehdIndexColor(level);
		let hasData = agi !== null && agi !== undefined;

		return {
			className: 'fehd-gravidtrap fehd-gravidtrap-area area ' + level,
			color: color,
			weight: hasData? 1.5 : 1,
			opacity: hasData? 0.9 : 0.5,
			fillColor: color,
			fillOpacity: hasData? 0.45 : 0.12
		};
	},

	getFehdAreaPopupHtml: function(properties) {
		let average = properties.average_agi_percent !== null && properties.average_agi_percent !== undefined? properties.average_agi_percent + '%' : 'N/A';
		let maximum = properties.max_agi_percent !== null && properties.max_agi_percent !== undefined? properties.max_agi_percent + '%' : 'N/A';
		return `
			<div class="fehd-area-popup">
				<h3>FEHD Gravidtrap Index</h3>
				<div><strong>Period:</strong> ${properties.period || 'N/A'}</div>
				<div><strong>District:</strong> ${properties.district || 'N/A'}</div>
				<div><strong>Average AGI:</strong> ${average}</div>
				<div><strong>Max AGI:</strong> ${maximum}</div>
				<div><strong>Survey areas with AGI:</strong> ${properties.count || 0}</div>
				<div><strong>Boundary:</strong> ${properties.boundary_level} aggregation</div>
				<div class="note">District boundary is used until official FEHD survey-area polygons are available.</div>
			</div>
		`;
	},

	addFehdAreaLayer: function(map, geojson) {
		if (!this.areaLayers) {
			this.areaLayers = {};
		}
		if (this.areaLayers.fehd_gravidtrap_area) {
			this.map.removeLayer(this.areaLayers.fehd_gravidtrap_area);
		}

		let layer = L.geoJSON(geojson, {
			style: (feature) => this.getFehdAreaStyle(feature),
			onEachFeature: (feature, areaLayer) => {
				areaLayer.bindPopup(this.getFehdAreaPopupHtml(feature.properties));
				areaLayer.on({
					mouseover: () => areaLayer.setStyle({ weight: 3, fillOpacity: 0.6 }),
					mouseout: () => areaLayer.setStyle(this.getFehdAreaStyle(feature))
				});
			}
		});

		this.areaLayers.fehd_gravidtrap_area = layer;
		layer.addTo(map);
		layer.bringToBack();
	},

	addFehdAreaObservations: function(map) {
		let requestId = this.nextRequestId('fehd_gravidtrap_area');
		this.fetchFehdAreaObservations({
			data: {
				before: QueryString.value('fehd_area_before'),
				after: QueryString.value('fehd_area_after')
			},
			success: (geojson) => {
				if (!this.isCurrentRequest('fehd_gravidtrap_area', requestId)) {
					return;
				}
				this.addFehdAreaLayer(map, geojson);
			}
		});
	},

	addObservationMarkers: function(map, source) {
		if (source === 'fehd_gravidtrap_area') {
			this.addFehdAreaObservations(map);
			return;
		}

		let selected = QueryString.value('selected');
		let requestId = this.nextRequestId(source);

		this.fetchObservations(source, {

			// filter parameters
			//
			data: {
				countries: QueryString.value('countries'),
				before: QueryString.value('before'),
				after: QueryString.value('after'),
				genera: QueryString.value('genera'),
				species: QueryString.value('species')
			},

			// callbacks
			//
			success: (observations) => {
				if (!this.isCurrentRequest(source, requestId)) {
					return;
				}
				// this.addMapMarkers(map, source, observations, selected);
				this.addClusteredMarkers(map, source, observations, selected);
			}
		});
	},

	addMarkers: function() {

		// store markers
		//
		this.markers = {};

		for (let i = 0; i < this.sources.length; i++) {
			let source = this.sources[i];
			this.addObservationMarkers(this.map, source);
		}
	},

	showMarkers: function() {
		this.removeMarkers();
		this.addMarkers();
	}
};
