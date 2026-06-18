################################################################################
#                                                                              #
#                                observation.py                                #
#                                                                              #
################################################################################
#                                                                              #
#        This is an abstract base class for models that can be stored to       #
#        a database.                                                           #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#     Copyright (C) 2025, Data Science Institute, University of Wisconsin      #
################################################################################

import json
import ast
from models.model import Model

class Observation(Model):

	#
	# attributes
	#

	fields = [
		'id',
		'x',
		'y'
	]

	#
	# data conversion methods
	#

	@staticmethod
	def to_value(key: str, data: object):
		return data

	@staticmethod
	def to_values(data: object):
		fields = {}
		count = 0
		for key in Observation.fields:
			fields[key] = Observation.to_value(key, data[count])
			count += 1
		return fields

	#
	# data parsing methods
	#

	@staticmethod
	def to_int(string: str):
		return int(string)

	@staticmethod
	def to_float(string: str):
		return float(string)

	@staticmethod
	def to_urls(string: str):
		if string == 'None':
			return []
		return string.split(';') if string else []

	@staticmethod
	def to_object(string: str):	
		if (string):
			try:
				return ast.literal_eval(string)
			except Exception as exception:
				print('An unexpected error has occurred:', exception)
				print("Error reading string: ", string)
				return string
		else:
			return None

	def to_object2(string: str):	
		if (string):
			try:
				return json.loads(string)
			except Exception as exception:
				print('An unexpected error has occurred:', exception)
				print("Error reading string: ", string)
				return string
		else:
			return None
