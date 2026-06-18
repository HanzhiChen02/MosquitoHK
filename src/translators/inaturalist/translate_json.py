################################################################################
#                                                                              #
#                              translate_json.py                               #
#                                                                              #
################################################################################
#                                                                              #
#        This is a utility for parsing a iNaturalist data.                     #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#        Copyright (C) 2025 - Global Mosquito Observations Dashboard           #
################################################################################

import os
import sys
import json
import csv
from utilities.json_translator import iNaturalistTranslator

#
# globals
#

translator = iNaturalistTranslator()

#
# utility functions
#

def read_file(filename):
	with open(filename, 'r') as file:
		data = file.read()
	return data

#
# output functions
#

def write_csv(file, observations):
	writer = csv.writer(file)

	# add headers
	#
	writer.writerow(translator.columns)

	# add columns
	#
	for observation in observations:
		observation = translator.translate_observation(observation)
		values = translator.object_to_array(observation)
		writer.writerow(values)

def write_new_csv(filename, observations):
	with open(filename, 'w', newline='') as file:
		write_csv(file, observations)

################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':

	# parse arguments
	#
	if (len(sys.argv) < 2):
		print("Usage: python3 translate_json.py <input-file-name> [<output-file-name>]");
		exit();

	# get command line arguments
	#
	filename = sys.argv[1]
	if len(sys.argv) > 2:
		outfilename = sys.argv[2]
	else:
		outfilename = None

	# parse data from observations
	#
	data = json.loads(read_file(filename))
	observations = data['results']

	# output transformed data
	#
	if outfilename:
		write_new_csv(outfilename, observations)
	else:
		write_csv(sys.stdout, observations)