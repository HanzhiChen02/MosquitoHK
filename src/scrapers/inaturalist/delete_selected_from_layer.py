################################################################################
#                                                                              #
#                        delete_selected_from_layer.py                         #
#                                                                              #
################################################################################
#                                                                              #
#        This is a script for deleting all data from the layer.                #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#        Copyright (C) 2025 - Global Mosquito Observations Dashboard           #
################################################################################

import sys
from scrape_to_layer import feature_layer

################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':

	# parse arguments
	#
	if (len(sys.argv) < 1):
		print("Usage: python3 delete_all.py");
		exit();

	# delete pre-existing data from layer
	#
	# where="observationResCatObsPheTime < '1900'"
	# where="observationResCatObsPheTime = '12/31/1899, 6:00:00 PM'"
	# where="observationResCatObsPheTime = NULL"
	# where="observationResCatObsPheTime is NULL"
	where="observationResCatObsPheTime <= '1900-01-01'"

	feature_layer.delete_features(where_clause=where)
