/******************************************************************************\
|                                                                              |
|                                 footer-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application footer and associated content.           |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseView from '../../views/base-view.js';

export default BaseView.extend({

	//
	// attributes
	//

	template: _.template(`
		<div class="container">
			<a href="<%= defaults.application.organization.url%>" target="_blank"><img class="logo" src="<%= defaults.footer.logo %>" /></a>
			<p>
				Copyright &copy; <%= defaults.application.year %>
				<% if (defaults.application.department) { %>
				<a href="<%= defaults.application.department.url %>" target="_blank"><%= defaults.application.department.name %></a>
				<% } %>
				<% if (defaults.application.organization) { %>
				<a href="<%= defaults.application.organization.url %>" target="_blank"><%= defaults.application.organization.name %></a>
				<% } %>
				<br />

				<% if (defaults.footer.links) { %>
				<% let keys = Object.keys(defaults.footer.links); %>
				<% for (i = 0; i < keys.length; i++) { %>
				<% let id = keys[i]; %>
				<% let text = defaults.footer.links[id].text; %>
				<% let href = defaults.footer.links[id].href; %>

				<% if (href) { %>
				<a id="<%= id %>" href="<%= href %>"><%= text %></a>
				<% } else { %>
				<a id="<%= id %>"><%= text %></a>
				<% } %>

				<% if (i !== keys.length - 1) { %> | <% } %>
				<% } %>
				<% } %>
			</p>
		</div>
	`)
});