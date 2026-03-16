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

	getHabitatMapperPopupData: function(data) {
		return {
			title: 'Habitat Mapper',
			source: 'habitat_mapper',
			attributes: {
				date: new Date(data.mhm_measuredDate).toLocaleDateString(),
				time: new Date(data.mhm_measuredDate).toTimeString(),
				site: data.mhm_siteName,
				genus: this.formatName(data.mhm_Genus),
				species: this.formatName(data.mhm_Species),
				location: this.toLocation(data),
				habitat_type: data.mhm_WaterSourceType,
				habitat: data.mhm_WaterSource,
				thumb_urls: data.mhm_LarvaFullBodyPhotoUrls.concat(data.mhm_WaterSourcePhotoUrls),
				photo_urls: data.mhm_LarvaFullBodyPhotoUrls.concat(data.mhm_WaterSourcePhotoUrls)
			}
		};
	},

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

	getLandCoverPopupData: function(data) {
		return {
			title: 'Land Cover',
			source: 'land_cover',
			attributes: {
				date: new Date(data.phenomenonTime).toLocaleDateString(),
				time: new Date(data.phenomenonTime).toTimeString(),
				location: this.toLocation(data),
				thumb_urls: data.imageResult && this.hasNonNullObject(data.imageResult)? [
					data.imageResult.lc_NorthPhotoUrl,
					data.imageResult.lc_SouthPhotoUrl,
					data.imageResult.lc_EastPhotoUrl,
					data.imageResult.lc_WestPhotoUrl,
					data.imageResult.lc_UpwardPhotoUrl,
					data.imageResult.lc_DownwardPhotoUrl
				] : [],
				photo_urls: data.imageResult && this.hasNonNullObject(data.imageResult)? [
					data.imageResult.lc_NorthPhotoUrl,
					data.imageResult.lc_SouthPhotoUrl,
					data.imageResult.lc_EastPhotoUrl,
					data.imageResult.lc_WestPhotoUrl,
					data.imageResult.lc_UpwardPhotoUrl,
					data.imageResult.lc_DownwardPhotoUrl
				] : [],
				captions: [
					"North",
					"South",
					"East",
					"West",
					"Up",
					"Down"
				]
			}
		};
	},

	getMosquitoAlertPopupData: function(data) {
		return {
			title: 'Mosquito Alert',
			source: 'mosquito_alert',
			attributes: {
				date: new Date(data.observationResCatObsPheTime).toLocaleDateString(),
				time: new Date(data.observationResCatObsPheTime).toTimeString(),
				site: data.locationName,
				location: this.toLocation(data),
				species: this.formatName(data.Indentified_by_Human),
				'adult, bite, or site': data.dataStreamDescription,
				research_grade: data.omPrcoessResQuaQuaGrade,
				thumb_urls: data.observationImaImaResult? [data.observationImaImaResult] : null,
				photo_urls: data.observationImaImaResult? [data.observationImaImaResult] : null
			}
		}
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

	getPopupData: function(source, data) {
		switch (source) {
			case 'habitat_mapper':
				return this.getHabitatMapperPopupData(data);
			case 'inaturalist':
				return this.getiNaturalistPopupData(data);
			case 'land_cover':
				return this.getLandCoverPopupData(data);
			case 'mosquito_alert':
				return this.getMosquitoAlertPopupData(data);
			case 'digitomy':
				return this.getDigitomyPopupData(data);
			default:
				alert("Unknown data source.")
		}
	}
};
