################################################################################
#                                                                              #
#                                  country.py                                  #
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

class Country(Model):

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
		self.table = 'countries'
		self.attributes = attributes;
