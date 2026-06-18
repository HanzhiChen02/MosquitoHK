################################################################################
#                                                                              #
#                             scrape_to_layer.py                               #
#                                                                              #
################################################################################
#                                                                              #
#        This is a script for scraping from the iNaturalist API.               #
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
from utilities.inaturalist_api import iNaturalistAPI

sys.path.insert(0, '../../esri')
from utilities.feature_layer import FeatureLayer

#
# globals
#

#feature_layer_url = 'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/iNaturalist_Layer_Test/FeatureServer'
#feature_layer_url = 'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/GMOD_iNaturalist_Layer/FeatureServer'
#feature_layer_url = 'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/New_Test_iNaturalist_Layer/FeatureServer'
feature_layer_url = 'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/New_iNaturalist_Layer/FeatureServer'
feature_layer = FeatureLayer(feature_layer_url)

################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':

	# parse arguments
	#
	if (len(sys.argv) < 2):
		print("Usage: python3 scrape_api.py <startdate> <endate>");
		exit();
	
	# parse command line args
	#
	if (len(sys.argv) < 3):
		start_date = sys.argv[1]
		end_date = None
	else:
		start_date = sys.argv[1]
		end_date = sys.argv[2]

	# fetch data in date range
	#
	print("Fetching data from", start_date, "to", end_date)
	data = iNaturalistAPI.fetch_data(start_date, end_date)

	# add data to feature layer
	#
	feature_layer.add_data(data)