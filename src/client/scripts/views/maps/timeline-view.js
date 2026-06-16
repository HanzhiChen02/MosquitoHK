/******************************************************************************\
|                                                                              |
|                              timeline-view.js                                |
|                                                                              |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import QueryString from '../../utilities/web/query-string.js';

export default BaseView.extend({

	id: function() {
		return this.options && this.options.id? this.options.id : 'timeline';
	},

	template: _.template(`
		<div class="timeline-header">
			<div>
				<strong class="timeline-title">Observation timeline / 觀測時間軸</strong>
				<span class="period">All dates / 全部日期</span>
			</div>
			<div class="mosquito-count"><strong>0</strong> <span class="count-label">mosquitoes / 蚊子觀測</span></div>
		</div>
		<input class="timeline-slider" type="range" min="0" max="0" value="0" step="1" aria-label="Observation month">
		<div class="timeline-range">
			<span class="start"></span>
			<span class="hint">Drag to filter one month / 拖動以篩選月份</span>
			<span class="end"></span>
		</div>
	`),

	events: {
		'input .timeline-slider': 'onChangePeriod',
		'change .timeline-slider': 'onCommitPeriod'
	},

	onAttach: function() {
		this.fetchTimeline();
	},

	update: function() {
		this.fetchTimeline();
	},

	fetchItems: function(kind) {
		let key = kind + 'List';
		if (this[key]) {
			return Promise.resolve(this[key]);
		}

		return fetch(config.server + '/' + kind)
		.then(response => response.json())
		.then(items => {
			this[key] = items;
			return items;
		});
	},

	fetchTimeline: function() {
		let source = this.getTimelineSource();
		let data = source === 'inaturalist'? {
			genera: QueryString.value('genera'),
			species: QueryString.value('species')
		} : {};
		let queryString = QueryString.encode(data);
		let url = config.server + '/observations/' + source.replace(/_/g, '-') + '/timeline';
		if (queryString) {
			url += '?' + queryString;
		}

		if (source === 'inaturalist') {
			Promise.all([
				fetch(url).then(response => response.json()),
				this.fetchItems('genera'),
				this.fetchItems('species')
			])
			.then(results => {
				this.timelineSource = source;
				this.timeline = results[0];
				this.generaList = results[1];
				this.speciesList = results[2];
				this.renderTimeline();
			});
		} else {
			fetch(url)
			.then(response => response.json())
			.then(timeline => {
				this.timelineSource = source;
				this.timeline = timeline;
				this.renderTimeline();
			});
		}
	},

	getTimelineSource: function() {
		if (this.options && this.options.source) {
			return this.options.source;
		}

		let dataBar = this.parent && this.parent.hasChildView && this.parent.hasChildView('data')?
			this.parent.getChildView('data') : null;
		if (dataBar && dataBar.isDataSourceSelected('fehd_gravidtrap')) {
			return 'fehd_gravidtrap';
		}
		if ($('#data-bar .fehd_gravidtrap').hasClass('selected')) {
			return 'fehd_gravidtrap';
		}
		return defaults.timeline.source || 'inaturalist';
	},

	isFehdTimeline: function() {
		return this.timelineSource === 'fehd_gravidtrap' || this.timelineSource === 'fehd_gravidtrap_area';
	},

	getAfterParamName: function() {
		return this.options && this.options.dateParamPrefix?
			this.options.dateParamPrefix + '_after' :
			'after';
	},

	getBeforeParamName: function() {
		return this.options && this.options.dateParamPrefix?
			this.options.dateParamPrefix + '_before' :
			'before';
	},

	getTimelineTitle: function() {
		if (this.options && this.options.title) {
			return this.options.title;
		}
		if (this.timelineSource === 'fehd_gravidtrap') {
			return 'FEHD survey-area point timeline / 監察點時間軸';
		}
		return this.isFehdTimeline()?
			'FEHD Gravidtrap Index / 食環署誘蚊器指數' :
			'Observation timeline / 觀測時間軸';
	},

	getSelectedNames: function(key, items) {
		let value = QueryString.value(key);
		if (!value) {
			return [];
		}

		return value.split(',')
		.map(index => items[parseInt(index) - 1])
		.filter(name => name);
	},

	getCountLabel: function() {
		let species = this.getSelectedNames('species', this.speciesList || []);
		if (species.length > 0) {
			return species.join(', ');
		}

		let genera = this.getSelectedNames('genera', this.generaList || []);
		if (genera.length > 0) {
			return genera.join(', ');
		}

		return 'mosquitoes / 蚊子觀測';
	},

	showCount: function(count) {
		this.$el.find('.mosquito-count strong').text(count.toLocaleString());
		this.$el.find('.count-label').text(this.getCountLabel());
	},

	showFehdMetric: function(bucket) {
		let value = bucket && bucket.average_agi_percent !== null?
			bucket.average_agi_percent.toLocaleString() :
			'0';
		this.$el.find('.mosquito-count strong').text(value);
		this.$el.find('.count-label').text('% average AGI / 平均誘蚊器指數');
	},

	getOverallFehdBucket: function() {
		let buckets = this.timeline.buckets || [];
		let total = 0;
		let weighted = 0;
		for (let i = 0; i < buckets.length; i++) {
			let bucket = buckets[i];
			if (bucket.average_agi_percent !== null) {
				total += bucket.count;
				weighted += bucket.average_agi_percent * bucket.count;
			}
		}
		return {
			average_agi_percent: total > 0? Math.round(weighted / total * 10) / 10 : null
		};
	},

	renderTimeline: function() {
		let buckets = this.timeline.buckets || [];
		let slider = this.$el.find('.timeline-slider');
		slider.attr('max', buckets.length);
		this.$el.find('.timeline-title').text(this.getTimelineTitle());
		this.$el.find('.start').text(buckets.length? buckets[0].period : '');
		this.$el.find('.end').text(buckets.length? buckets[buckets.length - 1].period : '');

		let after = QueryString.value(this.getAfterParamName());
		let selected = buckets.findIndex(bucket => bucket.period === (after? after.slice(0, 7) : ''));
		slider.val(selected >= 0? selected + 1 : 0);
		this.showPeriod(parseInt(slider.val()));
	},

	showPeriod: function(index) {
		if (!this.timeline) {
			return;
		}
		if (index === 0) {
			this.$el.find('.period').text('All dates / 全部日期');
			if (this.isFehdTimeline()) {
				this.showFehdMetric(this.getOverallFehdBucket());
			} else {
				this.showCount(this.timeline.total);
			}
			return;
		}

		let bucket = this.timeline.buckets[index - 1];
		this.$el.find('.period').text(bucket.period);
		if (this.isFehdTimeline()) {
			this.showFehdMetric(bucket);
		} else {
			this.showCount(bucket.count);
		}
	},

	nextMonth: function(period) {
		let terms = period.split('-');
		let date = new Date(parseInt(terms[0]), parseInt(terms[1]), 1);
		return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-01';
	},

	applyPeriod: function(index) {
		let afterParam = this.getAfterParamName();
		let beforeParam = this.getBeforeParamName();
		if (index === 0) {
			QueryString.remove(afterParam);
			QueryString.remove(beforeParam);
		} else {
			let period = this.timeline.buckets[index - 1].period;
			QueryString.add(afterParam, period + '-01');
			QueryString.add(beforeParam, this.nextMonth(period));
		}
		this.parent.update();
	},

	onChangePeriod: function(event) {
		this.showPeriod(parseInt($(event.target).val()));
	},

	onCommitPeriod: function(event) {
		this.applyPeriod(parseInt($(event.target).val()));
	}
});
