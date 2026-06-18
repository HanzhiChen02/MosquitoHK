################################################################################
#                                                                              #
#                            import_observations.py                            #
#                                                                              #
################################################################################
#                                                                              #
#        This is a script for importing mosquito observations to a db.         #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#     Copyright (C) 2026, Data Science Institute, University of Wisconsin      #
################################################################################

import os
import sys
import csv
import uuid
import requests
import mysql.connector
from models.observation import Observation

#
# globals
#

db = {
	'host': 'localhost',
	'port': 3306,
	'username': 'root',
	'password': 'root',
	'database': 'mosquito_dashboard'
}

#
# parsing functions
#

def read_file(filename, db):
	with open(filename, mode='r', newline='', encoding='cp1252') as csv_file:
		csv_reader = csv.DictReader(csv_file)
		# The 'fieldnames' attribute holds the header row
		headers = csv_reader.fieldnames
		print(f"Headers: {headers}")

		# add users to database
		#
		for row in csv_reader:
			observation = Observation({
				'id': str(uuid.uuid4()),
				'capture_id': row['capture_id'],
				'camera': row['camera'],
				'mosquito_index': row['mosquito_index'],
				'x1': row['x1'],
				'x2': row['x2'],
				'y1': row['y1'],
				'y2': row['y2'],
				'mosquito_gcs_url': row['mosquito_gcs_url'],
				'organization_id': row['organization_id'],
				'place': row['place'],
				'captured_at': row['captured_at'],
				'stickypad_gcs_url': row['stickypad_gcs_url'],
				'x': -82.41550, 
				'y': 28.05836,
			})

			observation.save(db)


################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':

	# parse arguments
	#
	if (len(sys.argv) < 2):
		print("Usage: python3 import_observations.py <input file name>");
		exit();

# connect to database
#
connection = mysql.connector.connect(
	host = db['host'],
	port = db['port'],
	username = db['username'],
	password = db['password'],
	database = db['database']
)

filename = sys.argv[1]
print("Reading file", filename)
read_file(filename, connection)
