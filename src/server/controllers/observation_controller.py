################################################################################
#                                                                              #
#                         habitat_mapper_controller.py                         #
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
from datetime import date, datetime
from flask import request, jsonify
from controllers.controller import Controller
from config.region import HONG_KONG_BOUNDS, is_in_hong_kong

class ObservationController(Controller):

	#
	# query construction methods
	#

	@staticmethod
	def add_condition(query: str, condition: str):
		query = query.rstrip(';')
		if 'WHERE' in query:
			return query + " AND " + condition
		return query + " WHERE " + condition

	@staticmethod
	def add_filter(query: str, column: str, operator: str, value):
		if column:
			query = ObservationController.add_condition(
				query,
				column + " " + operator + " '" + value + "'"
			)
		return query

	@staticmethod
	def add_hong_kong_filter(query: str, longitude_column: str = 'x', latitude_column: str = 'y'):
		bounds = HONG_KONG_BOUNDS
		condition = (
			longitude_column + " BETWEEN " + str(bounds['min_longitude']) +
			" AND " + str(bounds['max_longitude']) +
			" AND " + latitude_column + " BETWEEN " + str(bounds['min_latitude']) +
			" AND " + str(bounds['max_latitude'])
		)
		return ObservationController.add_condition(query, condition)

	def add_countries_filter(query: str, column: str, countries: array):
		if countries is None:
			return query

		# compose condition
		#
		condition = '('
		count = 0
		for country in countries:
			if count == 0:
				condition += (column + " LIKE '%" + country + "%'")
			else:
				condition += (" OR " + column + " LIKE '%" + country + "%'")
			count += 1
		condition += ')'

		# add condition to query
		#
		return ObservationController.add_condition(query, condition)

	@staticmethod
	def add_date_filter(query: str, column: str, after: str, before: str):
		if after:
			query = ObservationController.add_filter(query, column, '>=', after)
		if before:
			query = ObservationController.add_filter(query, column, '<', before)
		return query

	@staticmethod
	def parse_date(value: str):
		if not value:
			return None
		return date.fromisoformat(value)

	@staticmethod
	def validate_date_options(options: object):
		try:
			after = ObservationController.parse_date(options.get('after'))
			before = ObservationController.parse_date(options.get('before'))
		except (TypeError, ValueError):
			return 'Dates must use YYYY-MM-DD format.'

		if after and before and after >= before:
			return 'The after date must be earlier than the before date.'
		return None

	@staticmethod
	def month_key(value):
		if isinstance(value, datetime):
			return value.strftime('%Y-%m')
		if isinstance(value, date):
			return value.strftime('%Y-%m')
		if value:
			return str(value)[:7]
		return None

	def add_genera_filter(query: str, column: str, genera: array):
		if genera is None:
			return query

		# compose condition
		#
		condition = '('
		count = 0
		for genus in genera:
			if count == 0:
				condition += (column + " LIKE '%" + genus + "%'")
			else:
				condition += (" OR " + column + " LIKE '%" + genus + "%'")
			count += 1
		condition += ')'

		# add condition to query
		#
		return ObservationController.add_condition(query, condition)

	def add_species_filter(query: str, column: str, species: array):
		if species is None:
			return query

		# compose condition
		#
		condition = '('
		count = 0
		for specie in species:
			if count == 0:
				condition += (column + " = '" + specie + "'")
			else:
				condition += (" OR " + column + " = '" + specie + "'")
			count += 1
		condition += ')'

		# add condition to query
		#
		return ObservationController.add_condition(query, condition)

	#
	# genus getting methods
	#

	@staticmethod
	def get_genera(db: object, table: str):

		# connect to database
		#
		connection = ObservationController.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

		# create query
		#
		query = 'SELECT DISTINCT Indentified_by_Human FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		# execute query
		#
		cursor = connection.cursor()
		cursor.execute(query)
		data = cursor.fetchall()
		cursor.close()

		# get list of genera
		#
		genera = []
		if data:
			species = [array[0] for array in data]
			for item in species:
				if item and ' ' in item:
					terms = item.split(' ')
					genus = terms[0]
					if not genus in genera:
						genera.append(terms[0])
			genera.sort()

		# return results
		#
		return genera

	@staticmethod
	def get_genera_by_indices(db: object, table: str, indices: array):
		if indices is None:
			return []
		array = []
		genera = ObservationController.get_genera(db, table)
		if genera:
			indes = 0
			for index in indices:
				array.append(genera[int(index) - 1])
		return array

	#
	# getting methods
	#

	@staticmethod
	def filter_hong_kong_rows(data: list, longitude_index: int = 1, latitude_index: int = 2):
		return [
			item for item in data
			if is_in_hong_kong(item[longitude_index], item[latitude_index])
		]

	@staticmethod
	def is_hong_kong_observation(observation: object):
		return (
			observation is not None and
			is_in_hong_kong(observation.get('x'), observation.get('y'))
		)

	@staticmethod
	def get_all(db: object, query: str):

		# connect to database
		#
		connection = Controller.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

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
	def get_hong_kong_observations(db: object, query: str):
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data
		return ObservationController.filter_hong_kong_rows(data)

	@staticmethod
	def get_hong_kong_count(db: object, query: str):
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data
		return str(len(ObservationController.filter_hong_kong_rows(data, 0, 1)))

	@staticmethod
	def get_hong_kong_timeline(db: object, query: str):
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data

		counts = {}
		total = 0
		undated = 0
		for item in data:
			if not is_in_hong_kong(item[0], item[1]):
				continue
			total += 1
			month = ObservationController.month_key(item[2])
			if not month:
				undated += 1
				continue
			counts[month] = counts.get(month, 0) + 1

		return {
			'interval': 'month',
			'total': total,
			'undated': undated,
			'buckets': [
				{'period': month, 'count': counts[month]}
				for month in sorted(counts)
			]
		}

	@staticmethod
	def get_one(db: object, query: str):

		# connect to database
		#
		connection = Controller.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

		# execute query
		#
		cursor = connection.cursor()
		cursor.execute(query)
		data = cursor.fetchone()
		cursor.close()
		
		return data

	@staticmethod
	def get_value(db: object, query: str):

		# connect to database
		#
		connection = Controller.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

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
