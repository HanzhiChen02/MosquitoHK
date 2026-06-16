/******************************************************************************\
|                                                                              |
|                                  popup-data.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a mixin for per-source observation popup data.           |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export default {

	//
	// getting methods
	//

	getiNaturalistPopupData: function(data) {
		return {
			title: 'iNaturalist',
			source: 'inaturalist',
			attributes: {
				date: new Date(data.observationResCatObsPheTime).toLocaleDateString(),
				time: new Date(data.observationResCatObsPheTime).toTimeString(),
				location: this.toLocation(data),
				genus: this.formatName(data.Indentified_by_Human),
				common_name: data.ObsCPCommonName,
				thumb_urls: data.observationImaImaResult.map((result) => {
					return result.photo.url
				}),
				photo_urls: data.observationImaImaResult.map((result) => {
					return result.photo.url.replace('square', 'original');
				})
			}
		};
	},

	getDigitomyPopupData: function(data) {
		let root = 'images/observations/digitomy/';
		let stickypadRoot = root + 'stickypad/';
		let url = data.mosquito_gcs_url;
		let stickypadUrl = data.stickypad_gcs_url;
		let genderUrl = root + 'cam_gender.jpg';
		let genusUrl = root + 'cam_genus.jpg';
		let gonotrophyUrl = root + 'cam_gonotrophy.jpg';
		let sex = 'male';
		let genus = 'Aedes';
		let gonotrophy = 'unfed';

		if (url) {
			if (url.startsWith('gs://digitomy-tech-trap-images')) {
				url = root + url.split('/').at(-1);
			} else {
				url = root + url;
			}
		}

		if (stickypadUrl) {
			if (stickypadUrl.startsWith('gs://digitomy-tech-trap-images')) {
				stickypadUrl = stickypadRoot + stickypadUrl.split('/').at(-1).replace('processed_', '');
			} else {
				stickypadUrl = stickypadRoot + stickypadUrl;
			}
		}

		return {
			title: data.place,
			source: 'digitomy',
			attributes: {
				date: new Date(data.captured_at).toLocaleDateString(),
				time: new Date(data.captured_at).toTimeString(),
				site: this.toLocation(data.location),
				location: [data.y.toPrecision(6), data.x.toPrecision(6)],
				thumb_urls: [stickypadUrl, url, genusUrl, genderUrl, gonotrophyUrl],
				photo_urls: [stickypadUrl, url, genusUrl, genderUrl, gonotrophyUrl],
				captions: [
					'Stickypad: 002',
					'Mosquito: 004',
					'Genus: <span><i>' + genus + '</i></span>',
					'Sex: <span>' + sex + '</span>',
					'Gonotrophy: <span>' + gonotrophy + '</span>'
				]
			}
		}
	},

	getFehdGravidtrapPopupData: function(data) {
		return {
			title: 'FEHD Gravidtrap Index',
			source: 'fehd_gravidtrap',
			attributes: {
				period: data.period,
				district: data.district,
				survey_area: data.survey_area,
				area_gravidtrap_index: data.agi_percent !== null? data.agi_percent + '%' : null,
				area_density_index: data.adi,
				status: data.is_partial? 'First phase value / 第一階段數值' : 'Monthly value / 每月數值',
				source: data.source_document,
				official_map: data.map_url? '<a href="' + data.map_url + '" target="_blank" rel="noopener">Open Map.gov.hk survey area</a>' : null
			}
		};
	},

	getPopupData: function(source, data) {
		switch (source) {
			case 'inaturalist':
				return this.getiNaturalistPopupData(data);
			case 'digitomy':
				return this.getDigitomyPopupData(data);
			case 'fehd_gravidtrap':
				return this.getFehdGravidtrapPopupData(data);
			default:
				alert("Unknown data source.")
		}
	}
};
