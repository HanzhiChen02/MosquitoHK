################################################################################
#                                                                              #
#                            country_controller.py                             #
#                                                                              #
################################################################################
#                                                                              #
#        This controller is used to handle requests for observation info.      #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2025, Data Science Institute, University of Wisconsin      #
################################################################################

import flask
from array import array
from flask import request, jsonify
from controllers.controller import Controller
from models.country import Country

class CountryController(Controller):

	#
	# getting methods
	#

	@staticmethod
	def get_all(db: object):

		# connect to database
		#
		connection = Controller.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

		# create query
		#
		query = 'SELECT * FROM ' + Country().table;

		# execute query
		#
		cursor = connection.cursor()
		cursor.execute(query)
		data = cursor.fetchall()
		cursor.close()

		# return results
		#
		return data

	@staticmethod
	def get_by_indices(db: object, indices: array):
		if indices is None:
			return []
		array = []
		countries = CountryController.get_all(db)
		indes = 0
		for index in indices:
			country = countries[int(index) - 1]
			array.append(country[3])
		return array

	@staticmethod
	def get_index(db: object, id: str):

		# connect to database
		#
		connection = Controller.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

		# create query
		#
		query = 'SELECT * FROM ' + Country().table + " WHERE id = " + id;

		# execute query
		#
		cursor = connection.cursor()
		cursor.execute(query)
		data = cursor.fetchone()
		cursor.close()
		
		return data

	@staticmethod
	def get_num(db: object):

		# connect to database
		#
		connection = Controller.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

		# create query
		#
		query = 'SELECT COUNT(*) FROM ' + Country().table;

		# execute query
		#
		cursor = connection.cursor()
		cursor.execute(query)
		result = cursor.fetchone()
		value = result[0]
		cursor.close()

		# return num
		#
		return str(value)
