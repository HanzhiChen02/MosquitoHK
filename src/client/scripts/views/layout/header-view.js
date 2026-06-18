/******************************************************************************\
|                                                                              |
|                                 header-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application header and associated content.           |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';
import ShareDialogView from '../../views/dialogs/share-dialog-view.js';
import QueryString from '../../utilities/web/query-string.js';

export default BaseView.extend({

	//
	// attributes
	//

	className: 'navbar navbar-expand-lg fixed-top',

	template: _.template(`
		<a id="brand" class="active navbar-brand" href="#">
			<img class="logo" src="<%= defaults.navbar.icon %>" />
			<%= defaults.navbar.title %>
		</a>

		<% if (defaults.navbar.navs) { %>
		<ul class="nav navbar-nav">
			<% let keys = Object.keys(defaults.navbar.navs); %>
			<% for (let i = 0; i < keys.length; i++) { %>
			<% let key = keys[i]; %>
			<% let item = defaults.navbar.navs[key]; %>
			<li class="<%= key %><% if (nav === key) {%> active <% } %>">
				<a href="<%= item.href %>"<% if (item.color) { %> style="--primary-color:<%= item.color %>"<% } %>>
					<i class="<%= item.icon %>"></i>
					<span class="hidden-xs"><%= item.text %></span>
				</a>
			</li>
			<% } %>
		</ul>

		<ul class="nav navbar-right">
			<button class="social share-by-link btn" data-toggle="tooltip" title="Share By Link" data-placement="left">
				<i class="fa fa-share"></i>
				Share
			</button>
		</ul>
		<% } %>
	`),

	events: {
		'click #brand': 'onClickBrand',
		'click a': 'onClickLink',
		'click .share-by-link': 'onClickShareByLink'
	},

	//
	// rendering methods
	//

	templateContext: function() {
		return {
			nav: this.options.nav
		};
	},

	onRender: function() {

		// add tooltip triggers
		//
		this.addTooltips();
	},

	showShareByLinkDialog: function() {
		application.show(new ShareDialogView({
			link: window.location
		}));
	},

	//
	// event handling methods
	//

	onClickBrand: function(event) {
		event.preventDefault();

		// clear current state
		//
		let dark = QueryString.value('dark');
		QueryString.clear();
		QueryString.add('dark', dark);

		// go to main view
		//
		application.router.showMain();
	},

	onClickLink: function(event) {
		let url = $(event.target).closest('a').attr('href');

		// if internal link
		//
		if (!url.startsWith('http')) {
			application.router.navigate(url, {
				trigger: true
			});
		}
	},

	onClickShareByLink: function() {
		this.showShareByLinkDialog();
	}
});
