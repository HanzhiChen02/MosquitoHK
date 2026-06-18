/******************************************************************************\
|                                                                              |
|                             popover-showable.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a behavior for displaying popovers.                      |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

import '../../../../vendor/popper/popper.min.js';

export default {

	//
	// attributes
	//

	popover_container: 'body',
	popover_trigger: 'hover',
	popover_placement: 'top',

	//
	// rendering methods
	//

	addPopovers: function() {
		
		// show popovers on trigger
		//
		this.$el.find('[data-toggle="popover"]').addClass('popover-trigger').popover({
			container: this.popover_container,
			trigger: this.popover_trigger,
			placement: this.popover_placement
		});
	},

	removePopovers: function() {
		$('.popover').remove();
	}
};
