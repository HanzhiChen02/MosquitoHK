################################################################################
#                                                                              #
#                           digitomy_observation.py                            #
#                                                                              #
################################################################################
#                                                                              #
#        This is a model for managing habitat mapper observations.             #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#     Copyright (C) 2025, Data Science Institute, University of Wisconsin      #
################################################################################

import random
from models.observation import Observation

class DigitomyObservation(Observation):

	#
	# attributes
	#

	fields = [
		'id',
		'x',
		'y',
		'capture_id',
		'camera',
		'mosquito_index',
		'x1',
		'x2',
		'y1',
		'y2',
		'mosquito_gcs_url',
		'organization_id',
		'place',
		'captured_at',
		'stickypad_gcs_url'
	]

	#
	# constructor
	#

	def __init__(self, attributes: object = {}):

		"""
		Creates a new model with the specified attributes.

		Parameters:
			attributes (dict): The model's attributes
		"""

		# set attributes
		#
		self.table = 'digitomy'
		self.attributes = attributes;

	#
	# conversion methods
	#

	@staticmethod
	def to_values(data: object):
		fields = {}
		count = 0
		for key in Observation.fields:
			fields[key] = Observation.to_value(key, data[count])
			if key == 'x' or key == 'y':
				fields[key] = float(fields[key]) + random.random() * 0.001
			count += 1
		return fields

	@staticmethod
	def to_all_values(data: object):
		fields = {}
		count = 0
		for key in DigitomyObservation.fields:
			fields[key] = Observation.to_value(key, data[count])
			if key == 'x' or key == 'y':
				fields[key] = float(fields[key]) + random.random() * 0.001
			count += 1
		return fields
