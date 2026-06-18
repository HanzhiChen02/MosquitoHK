/******************************************************************************\
|                                                                              |
|                                 countries.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of countries.                          |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import Country from '../models/country.js';
import NamedItems from '../collections/named-items.js';

export default NamedItems.extend({

	//
	// Backbone attributes
	//

	model: Country,
	url: config.server + '/countries'
});