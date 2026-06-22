/******************************************************************************\
|                                                                              |
|                        landscape-timeline-view.js                            |
|                                                                              |
\******************************************************************************/

import BaseView from '../../views/base-view.js';

export default BaseView.extend({

	id: 'landscape-timeline',

	template: _.template(`
		<div class="timeline-header">
			<div>
				<strong class="timeline-title">Landscape timeline / 土地用途時間軸</strong>
				<span class="period"></span>
			</div>
			<button class="landscape-play" type="button" title="Play annual landscape changes">
				<i class="fa fa-play"></i>
				<span>Play</span>
			</button>
		</div>
		<input class="timeline-slider" type="range" min="0" max="0" value="0" step="1" aria-label="Landscape year">
		<div class="timeline-range">
			<span class="start"></span>
			<span class="hint">Drag to compare annual land use / 拖動以比較年度土地用途</span>
			<span class="end"></span>
		</div>
	`),

	events: {
		'input .timeline-slider': 'onChangeYear',
		'change .timeline-slider': 'onCommitYear',
		'click .landscape-play': 'onClickPlay'
	},

	initialize: function(options) {
		this.options = options || {};
		this.parent = this.options.parent;
		this.playTimer = null;
	},

	onAttach: function() {
		this.parent.getLandscapeManifest().then(manifest => {
			this.years = manifest.years.map(item => item.year);
			let selectedYear = this.parent.getLandscapeYear();
			let selectedIndex = this.years.indexOf(selectedYear);
			let slider = this.$el.find('.timeline-slider');

			slider.attr('max', Math.max(this.years.length - 1, 0));
			slider.val(selectedIndex >= 0? selectedIndex : this.years.length - 1);
			this.$el.find('.start').text(this.years[0] || '');
			this.$el.find('.end').text(this.years[this.years.length - 1] || '');
			this.showYear(parseInt(slider.val()));
		});
	},

	showYear: function(index) {
		if (!this.years || !this.years.length) {
			return;
		}
		let year = this.years[index];
		this.$el.find('.period').text(year);
		this.parent.previewLandscapeYear(year);
	},

	commitYear: function(index) {
		if (!this.years || !this.years.length) {
			return;
		}
		this.parent.setLandscapeYear(this.years[index]);
	},

	setPlaying: function(playing) {
		let button = this.$el.find('.landscape-play');
		button.toggleClass('playing', playing);
		button.find('i')
			.toggleClass('fa-play', !playing)
			.toggleClass('fa-pause', playing);
		button.find('span').text(playing? 'Pause' : 'Play');
	},

	startPlaying: function() {
		this.stopPlaying();
		this.setPlaying(true);
		this.playTimer = window.setInterval(() => {
			let slider = this.$el.find('.timeline-slider');
			let next = (parseInt(slider.val()) + 1) % this.years.length;
			slider.val(next);
			this.showYear(next);
			this.commitYear(next);
		}, 1200);
	},

	stopPlaying: function() {
		if (this.playTimer) {
			window.clearInterval(this.playTimer);
			this.playTimer = null;
		}
		this.setPlaying(false);
	},

	onChangeYear: function(event) {
		this.showYear(parseInt($(event.currentTarget).val()));
	},

	onCommitYear: function(event) {
		this.commitYear(parseInt($(event.currentTarget).val()));
	},

	onClickPlay: function() {
		if (this.playTimer) {
			this.stopPlaying();
		} else {
			this.startPlaying();
		}
	},

	onBeforeDestroy: function() {
		this.stopPlaying();
	}
});
