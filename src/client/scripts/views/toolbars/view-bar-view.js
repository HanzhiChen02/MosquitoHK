/******************************************************************************\
|                                                                              |
|                             view-bar-view.js                                 |
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
import DateRangeSelectorDialogView from '../../views/maps/dialogs/date-range-selector-dialog-view.js';
import GeneraSelectorDialogView from '../../views/maps/dialogs/genera-selector-dialog-view.js';
import SpeciesSelectorDialogView from '../../views/maps/dialogs/species-selector-dialog-view.js';
import StatsDialogView from '../../views/maps/dialogs/stats-dialog-view.js';
import QueryString from '../../utilities/web/query-string.js';

export default ToolbarView.extend({

	//
	// attributes
	//

	id: 'view-bar',
	className: 'vertical toolbar',

	template: _.template(`
		<div class="title">Filters</div>

		<div class="buttons">

			<button id="date" data-toggle="tooltip" title="Date" data-placement="right">
				<i class="fa fa-calendar"></i>
			</button>

			<button id="genera" data-toggle="tooltip" title="Genera" data-placement="right">
				<i class="fa fa-mosquito"></i>
			</button>

			<button id="species" data-toggle="tooltip" title="Species" data-placement="right">
				<i class="fa fa-mosquito" style="transform:scale(0.75)"></i>
			</button>

			<button id="stats" data-toggle="tooltip" title="Stats" data-placement="right">
				<i class="fa fa-table"></i>
			</button>

			<button id="toggle-fullscreen" data-toggle="tooltip" title="Toggle Fullscreen" data-placement="right" class="desktop-only">
				<i class="fa fa-desktop"></i>
			</button>
		</div>
	`),

	events: {
		'click #date': 'onClickDate',
		'click #genera': 'onClickGenera',
		'click #species': 'onClickSpecies',
		'click #stats': 'onClickStats',
		'click #toggle-fullscreen': 'onClickToggleFullscreen'
	},

	//
	// ajax methods
	//

	fetchGenera: function(options) {
		$.ajax(config.server + '/genera', options);
	},

	fetchSpecies: function(options) {
		$.ajax(config.server + '/species', options);
	},

	//
	// ajax rendering methods
	//

	fetchAndShowGeneraDialog: function() {
		if (!this.genera) {
			application.showSpinner();
			this.fetchGenera({
				success: (genera) => {
					this.genera = genera;
					application.hideSpinner();
					this.showGeneraDialog(this.genera);
				}
			});
		} else {
			this.showGeneraDialog(this.genera);
		}
	},

	fetchAndShowSpeciesDialog: function() {
		if (!this.species) {
			application.showSpinner();
			this.fetchSpecies({
				success: (species) => {
					this.species = species;
					application.hideSpinner();
					this.showSpeciesDialog(this.species);
				}
			});
		} else {
			this.showSpeciesDialog(this.species);
		}
	},

	//
	// querying methods
	//

	isButtonSelected: function(name) {
		return this.$el.find('#' + name).hasClass('selected');
	},

	isFullScreenSelected: function() {
		return this.isButtonSelected('toggle-fullscreen');
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
	// rendering methods
	//

	onRender: function() {

		// call superclass method
		//
		ToolbarView.prototype.onRender.call(this);

		// set initial state
		//
		if (QueryString.has('before') || QueryString.has('after')) {
			this.selectButton('date');
		}
		if (QueryString.has('genera')) {
			this.selectButton('genera');
		}
		if (QueryString.has('species')) {
			this.selectButton('species');
		}
	},

	showDateDialog: function() {
		application.show(new DateRangeSelectorDialogView({
			opener: this
		}));
	},

	showGeneraDialog: function(genera) {
		application.show(new GeneraSelectorDialogView({
			genera: genera,
			opener: this
		}));
	},

	showSpeciesDialog: function(species) {
		application.show(new SpeciesSelectorDialogView({
			species: species,
			opener: this
		}));
	},

	showStatsDialog: function() {
		application.show(new StatsDialogView({
			opener: this
		}));
	},

	toggleFullScreen: function() {
		if (!this.isFullScreenSelected()) {
			this.selectButton('toggle-fullscreen');
			this.parent.requestFullScreen();
		} else {
			this.deselectButton('toggle-fullscreen');
			this.parent.exitFullScreen();
		}
	},

	//
	// mouse event handling methods
	//

	onClickDate: function() {
		this.showDateDialog();
	},

	onClickGenera: function() {
		this.fetchAndShowGeneraDialog();
	},

	onClickSpecies: function() {
		this.fetchAndShowSpeciesDialog();
	},

	onClickStats: function() {
		this.showStatsDialog();
	},

	onClickToggleFullscreen: function() {
		this.toggleFullScreen();
	}
});
