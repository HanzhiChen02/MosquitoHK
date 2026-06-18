/******************************************************************************\
|                                                                              |
|                                  country.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a backbone base model.                        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import BaseModel from '../models/base-model.js';

export default BaseModel.extend({

	//
	// ajax attributes
	//

	urlRoot: config.server + '/countries',

	//
	// getting methods
	//

	getFlag: function() {
		return this.get('iso').toLowerCase();
	}
});