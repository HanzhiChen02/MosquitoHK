/******************************************************************************\
|                                                                              |
|                                query-string.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file contains some javascript utilities that are used to         |
|        deal with the browser address bar.                                    |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import AddressBar from '../../utilities/web/address-bar.js';
import Url from '../../utilities/web/url.js';

export default {

	//
	// converting methods
	//

	toObject: function() {
		return this.decode(this.get());
	},

	toTerms: function(queryString) {
		if (queryString.includes('#')) {
			queryString = queryString.split('#')[0];
		}
		return queryString.split('&');
	},

	//
	// querying methods
	//

	exists: function() {
		return AddressBar.get('location').includes('?');
	},

	has: function(key, options) {
		return (this.value(key, options) !== undefined);
	},

	//
	// getting methods
	//

	get: function() {
		let location = AddressBar.get('location');

		// get location after question mark symbol
		//
		if (location.includes('?')) {
			let sections = location.split('?');
			return sections[sections.length - 1];
		}
	},

	value: function(key, options) {
		let queryString;

		// get query string
		//
		if (options && options.queryString) {
			queryString = options.queryString;
		} else {
			queryString = this.get();
		}

		if (!queryString) {
			return undefined;
		}
		
		// split query string into key value pairs
		//
		let terms = this.toTerms(queryString);
		for (let i = 0; i < terms.length; i++) {
			let term = terms[i];

			// split key value pair by first equal sign
			//
			let equalSign = term.indexOf('=');
			let string = term.substring(0, equalSign);
			let value = term.substring(equalSign + 1);

			// check if key matches
			//
			if (key === string) {
				return value;
			}
		}
		
		return undefined;
	},

	values: function(key, options) {
		let queryString;
		let values = [];

		// get query string
		//
		if (options && options.queryString) {
			queryString = options.queryString;
		} else {
			queryString = this.get();
		}

		if (!queryString) {
			return undefined;
		}
		
		// split query string into key value pairs
		//
		let terms = this.toTerms(queryString);
		for (let i = 0; i < terms.length; i++) {
			let term = terms[i];

			// split key value pair by first equal sign
			//
			let equalSign = term.indexOf('=');
			let string = term.substring(0, equalSign);
			let value = term.substring(equalSign + 1);

			// check if key matches
			//
			if (string === key) {
				values.push(value);
			}
		} 
		
		return values;
	},

	//
	// setting methods
	//

	set: function(queryString) {
		let address = AddressBar.get('base') + (queryString? "?" + queryString : '');
		AddressBar.set(address);
	},

	push: function(queryString) {
		let address = AddressBar.get('base') + (queryString? "?" + queryString : '');
		AddressBar.push(address);
	},

	clear: function() {
		let address = AddressBar.get('location').split('?')[0];
		AddressBar.set(address);
	},

	//
	// attribute setting methods
	//

	add: function(key, value) {
		if (typeof key !== 'string') {
			this.addAll(key);
			return;
		}
		let object = this.toObject();
		object[key] = value;
		this.set(this.encode(object));
	},

	remove: function(key) {
		if (typeof key !== 'string') {
			this.removeAll(key);
			return;
		}
		let object = this.toObject();
		delete object[key];
		this.set(this.encode(object));
	},

	addAll: function(object) {
		for (const key in object) {
			this.add(key, object[key]);
		}
	},

	removeAll: function(object) {
		for (const key in object) {
			this.remove(key, object[key]);
		}
	},

	//
	// construction methods
	//

	concat: function(queryString, newString) {
		if (queryString && queryString !== '' && newString && (newString !== undefined)) {
			return queryString + '&' + newString;
		} else if (queryString && queryString !== '') {
			return queryString;
		} else {
			return newString;
		}
	},

	//
	// converting methods
	//

	encode: function(data) {
		let queryString = '';
		for (let key in data) {
			let value = data[key];
			if (value !== undefined) {
				if (typeof value !== 'string') {
					value = value.toString();
				}
				queryString = this.concat(queryString, key + '=' + Url.encode(value));
			}
		}

		// decode commas
		//
		queryString = queryString.replace(/%2C/g, ',');

		return queryString;
	},

	decode: function(queryString) {
		let data = {};

		// check for query string
		//
		if (!queryString) {
			return data;
		}

		// split query string into key value pairs
		//
		let terms = this.toTerms(queryString);
		for (let i = 0; i < terms.length; i++) {
			let term = terms[i];

			// split key value pair by first equal sign
			//
			let equalSign = term.indexOf('=');
			let key = term.substring(0, equalSign);
			let value = term.substring(equalSign + 1);

			// check for array values
			//
			if (key.endsWith('[]')) {

				// add item to array
				//
				let array = key.substring(0, key.length - 2);
				if (data[array]) {
					data[array].push(value);
				} else {
					data[array] = [value];
				}
			} else {
				data[key] = value;
			}
		}

		return data;
	}
};