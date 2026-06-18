/******************************************************************************\
|                                                                              |
|                            observation-popups.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a mixin for showing map observation popups.              |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import QueryString from '../../utilities/web/query-string.js';
import ShareDialogView from '../../views/dialogs/share-dialog-view.js';
import Browser from '../../utilities/web/browser.js';
import PopupData from '../../views/maps/popup-data.js';
import { toTitleCase} from '../../utilities/scripting/string-utils.js';

export default _.extend({}, PopupData, {

	//
	// attributes
	//

	popupTemplate: _.template(`
		<div class="title"><%= title %></div>
		<hr />
		<% let keys = Object.keys(attributes); %>
		<div class="buttons">
			<button class="social share btn"><i class="fa fa-share"></i>Share</button>
		</div>
		<% for (i = 0; i < keys.length; i++) { %>
		<% let key = keys[i]; %>
		<% let label = toTitleCase((keys[i].replace(/_/g, ' '))); %>
		<% let value = attributes[key]; %>
		<% if (value && value !== 'None' && key !== 'photo_urls' && key !== 'thumb_urls' && key !== 'captions') { %>
		<div class="value">
			<label><%= label %>:</label>
			<%= value %>
		</div>
		<% } %>
		<% } %>
		<% if (attributes.thumb_urls && attributes.photo_urls.length > 0) { %>
		<hr />
		<div class="photos">
			<% if (source == 'digitomy') { %>
			<div class="group">
			<% } %>
				<% for (let i = 0; i < attributes.photo_urls.length; i++) { %>
				<% let photo_url = attributes.photo_urls[i]; %>
				<% let thumb_url = attributes.thumb_urls[i]; %>
				<% let caption = attributes.captions? attributes.captions[i] : null; %>
				<% if (thumb_url) { %>
				<div class="photo">
					<a href="<%= photo_url %>" data-fancybox="gallery" class="lightbox"<% if (caption) { %> data-caption="<%= caption.replace('<br />', '') %>"<% } %>>
						<div class="preview">
							<img src="<%= thumb_url %>" />
							<% if (caption && caption.startsWith('Stickypad')) { %>
							<div class="bounding-box" style="
								left:<%= bounding_box.left %>px;
								top:<%= bounding_box.top %>px;
								width:<%= bounding_box.width %>px;
								height:<%= bounding_box.height %>px"
							></div>
							<% } %>
						</div>
					</a>
					<% if (caption) { %><label><%= caption %></label><% } %>
				</div>
				<% } %>
				<% if (i == 1 && source == 'digitomy') { %></div><div class="group"><% } %>
				<% } %>
			<% if (source == 'digitomy') { %>
			</div>
			<% } %>
		</div>
		<% } %>
	`),

	//
	// formatting methods
	//

	formatName: function(name) {
		if (!name || name.length === 0) {
			return name;
		}

		let terms = name.split(' ');
		for (let i = 0; i < terms.length; i++) {
			let term = terms[i];
			if (term.toLowerCase() !== 'insecta' && !term.endsWith('dae')) {
				terms[i] = '<i>' + term + '</i>';
			}
		}

		return terms.join(' ');
	},

	toLocation: function(location) {
		if (location && location.y && location.x) {
			return [location.y.toPrecision(6), location.x.toPrecision(6)];
		}
		return location;
	},

	//
	// ajax functions
	//

	fetchObservation: function(source, id, options) {
		fetch(config.server + '/observations/' + source.replace(/_/g, '-') + '/' + id)
		.then(response => response.json())
		.then(data => {
			if (options && options.success) {
				options.success(data);
			}
		});
	},

	//
	// lightbox methods
	//

	addLightBox: function(element) {
		$(element).find('.lightbox').fancybox({

			// options
			//
			padding: 0,
			margin: 20,
			openEffect: 'elastic',
			closeEffect: 'elastic',
			type : "image",
			autoResize  : true,
			fitToView : true,
			loop: true,

			buttons: [
				"zoom",
				"slideShow",
				"fullScreen",
				"download",
				"thumbs",
				"close"
			]
		});
	},

	//
	// getting methods
	//

	getBoundingBox: function(data) {
		let xsize = 8000;
		let ysize = 6000;
		let size = 100;
		if (!data) {
			return;
		}
		return {
			left: Math.round(data.x1 / xsize * size),
			top: Math.round(data.y1 / ysize * size),
			width: Math.round((data.x2 - data.x1) / xsize * size),
			height: Math.round((data.y2 - data.y1) / ysize * size)
		}
	},

	//
	// popup methods
	//

	hasNonNullObject: function(object) {
		let keys = Object.keys(object);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			if (object[key] !== null) {
				return true;
			}
		}
		return false;
	},

	showMarkerPopup: function(marker, data) {
		let html = this.popupTemplate(_.extend({},
			this.getPopupData(marker.options.source, data), {
				toTitleCase: toTitleCase,
				bounding_box: this.getBoundingBox(data)
			}
		));

		// select marker
		//
		$(marker._path || marker._icon).addClass('selected');

		// save selected item
		//
		QueryString.add('selected', marker.options.id);

		// open popup
		//
		marker.bindPopup(html).openPopup();

		// hide UI toolbars
		//
		if (Browser.is_mobile) {
			$('#user-interface').hide();
		}

		// get popup element
		//
		let popup = marker.getPopup();
		let element = popup.getElement();

		// add share button action
		//
		$(element).find('.share').click(() => {
			application.show(new ShareDialogView({
				link: window.location
			}));
		});

		// add lightbox to popup images
		//
		if (popup && popup.isOpen()) {
			this.addLightBox(element);
		}

		// show UI toolbars on close
		//
		popup.on('remove', () => {
			if (Browser.is_mobile) {
				$('#user-interface').show();
			}

			// deselect marker
			//
			$(marker._path || marker._icon).removeClass('selected');

			// clear selected item
			//
			QueryString.remove('selected');
		});
	},

	addObservationPopup: function(marker) {
		this.fetchObservation(marker.options.source, marker.options.id, {

			// callbacks
			//
			success: (data) => {
				this.showMarkerPopup(marker, data)
			}
		});
	}
});
