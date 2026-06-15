/******************************************************************************\
|                                                                              |
|                              timeline-view.js                                |
|                                                                              |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import QueryString from '../../utilities/web/query-string.js';

export default BaseView.extend({

	id: 'timeline',

	template: _.template(`
		<div class="timeline-header">
			<div>
				<strong>Observation timeline / 觀測時間軸</strong>
				<span class="period">All dates / 全部日期</span>
			</div>
			<div class="mosquito-count"><strong>0</strong> mosquitoes / 蚊子觀測</div>
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

	fetchTimeline: function() {
		let data = {
			genera: QueryString.value('genera'),
			species: QueryString.value('species')
		};
		let queryString = QueryString.encode(data);
		let url = config.server + '/observations/inaturalist/timeline';
		if (queryString) {
			url += '?' + queryString;
		}

		fetch(url)
		.then(response => response.json())
		.then(timeline => {
			this.timeline = timeline;
			this.renderTimeline();
		});
	},

	renderTimeline: function() {
		let buckets = this.timeline.buckets || [];
		let slider = this.$el.find('.timeline-slider');
		slider.attr('max', buckets.length);
		this.$el.find('.start').text(buckets.length? buckets[0].period : '');
		this.$el.find('.end').text(buckets.length? buckets[buckets.length - 1].period : '');

		let after = QueryString.value('after');
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
			this.$el.find('.mosquito-count strong').text(this.timeline.total.toLocaleString());
			return;
		}

		let bucket = this.timeline.buckets[index - 1];
		this.$el.find('.period').text(bucket.period);
		this.$el.find('.mosquito-count strong').text(bucket.count.toLocaleString());
	},

	nextMonth: function(period) {
		let terms = period.split('-');
		let date = new Date(parseInt(terms[0]), parseInt(terms[1]), 1);
		return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-01';
	},

	applyPeriod: function(index) {
		if (index === 0) {
			QueryString.remove('after');
			QueryString.remove('before');
		} else {
			let period = this.timeline.buckets[index - 1].period;
			QueryString.add('after', period + '-01');
			QueryString.add('before', this.nextMonth(period));
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
