################################################################################
#                                                                              #
#                               scrape_to_db.py                                #
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
import config
import mysql.connector
from utilities.inaturalist_api import iNaturalistAPI
from utilities.inaturalist_observation import iNaturalistObservation

#
# globals
#

db = {
	'host': config.DB_HOST,
	'port': config.DB_PORT,
	'username': config.DB_USERNAME,
	'password': config.DB_PASSWORD,
	'database': config.DB_DATABASE	
}

################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':
	connection = None

	# connect to database
	#
	try:
		connection = mysql.connector.connect(
			host = db['host'],
			port = db['port'],
			username = db['username'],
			password = db['password'],
			database = db['database']
		)
	except Exception as e:
		print("Could not connect to database.")
		logging.exception(str(e))
		print(str(e))

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

	# save data to db
	#
	if data:
		for item in data:
			observation = iNaturalistObservation(item)
			observation.save(connection)