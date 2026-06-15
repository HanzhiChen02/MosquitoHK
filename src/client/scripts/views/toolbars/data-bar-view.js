/******************************************************************************\
|                                                                              |
|                             data-bar-view.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a toolbar view for view settings.                        |
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

	id: 'data-bar',
	className: 'vertical toolbar',

	template: _.template(`
		<div class="title">Layers</div>

		<div class="buttons">
			<% if (defaults.sources.includes('inaturalist')) { %>
			<button class="inaturalist data-source" data-source="inaturalist" data-toggle="tooltip" title="iNaturalist" data-placement="right">
				<img class="icon" src="images/logos/inaturalist.png" />
			</button>
			<% } %>

			<% if (defaults.sources.includes('digitomy')) { %>
			<button class="digitomy data-source" data-source="digitomy" data-toggle="tooltip" title="Digitomy" data-placement="right">
				<i class="fa fa-crosshairs"></i>
			</button>
			<% } %>
		</div>
	`),

	events: {
		'click .data-source': 'onClickDataSource'
	},

	//
	// querying methods
	//

	isDataSourceSelected: function(source) {
		return this.$el.find('.' + source).hasClass('selected');
	},

	numSources: function() {
		return this.$el.find('button').length;
	},

	getSourceByIndex: function(index) {
		return $(this.$el.find('button')[index]).attr('data-source');
	},

	getSources: function() {
		let buttons = this.$el.find('button');
		let sources = [];
		for (let i = 0; i < buttons.length; i++) {
			sources.push(i + 1);
		}
		return sources;
	},

	getSelectedSources: function() {
		let buttons = this.$el.find('button');
		let sources = [];
		for (let i = 0; i < buttons.length; i++) {
			let button = buttons[i];
			if ($(button).hasClass('selected')) {
				sources.push(i + 1);
			}
		}
		return sources;
	},

	//
	// selecting methods
	//

	selectAll: function() {
		let num = this.numSources();
		for (let i = 0; i < num; i++) {
			let source = this.getSourceByIndex(i);
			this.select(source);
		}
	},

	deselectAll: function() {
		let num = this.numSources();
		for (let i = 0; i < num; i++) {
			let source = this.getSourceByIndex(i);
			this.deselect(source);
		}
	},

	select: function(source) {
		this.$el.find('button.' + source).addClass('selected');
		this.parent.showDataSource(source);
	},

	deselect: function(source) {
		this.$el.find('button.' + source).removeClass('selected');
		this.parent.hideDataSource(source);
	},

	toggle: function(source) {
		if (this.isDataSourceSelected(source)) {
			this.deselect(source);
		} else {
			this.select(source);
		}
	},

	selectByIndices: function(indices) {
		if (!indices) {
			this.deselectAll();
		} else {
			let num = this.numSources();
			for (let i = 0; i < num; i++) {
				let source = this.getSourceByIndex(i);
				if (indices.includes(i + 1)) {
					this.select(source);
				} else {
					this.deselect(source);
				}
			}
		}
	},

	//
	// rendering methods
	//

	onRender: function() {

		// call superclass method
		//
		ToolbarView.prototype.onRender.call(this);

		// update from query string
		//
		let data = QueryString.value('data');
		if (data) {
			let values = data.split(',');
			for (let i = 0; i < values.length; i++) {
				values[i] = parseInt(values[i]);
			}
			this.selectByIndices(values);
		} else {
			this.selectAll();
		}
	},

	//
	// mouse event handling methods
	//

	onClickDataSource: function(event) {
		let $button = $(event.target).closest('button');
		let source = $button.attr('data-source');

		// show / hide
		//
		this.toggle(source);

		// update query string
		//
		let selectedSources = this.getSelectedSources();
		if (selectedSources.length < this.numSources()) {
			if (selectedSources.length > 0) {
				QueryString.add('data', selectedSources);
			} else {
				QueryString.add('data', 0);
			}
		} else {
			QueryString.remove('data');
		}

		/*
		if (!this.isShowMapSelected()) {
			this.$el.find('#show-map').addClass('selected');
			this.parent.getChildView('map').show();
			this.parent.showMap();
		} else {
			this.$el.find('#show-map').removeClass('selected');
			this.parent.getChildView('map').hide();
			this.parent.hideMap();
		}
		*/
	}
});
