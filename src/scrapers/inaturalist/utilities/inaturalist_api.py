################################################################################
#                                                                              #
#                             inaturalist_api.py                               #
#                                                                              #
################################################################################
#                                                                              #
#        This is a script for interfacing with the iNaturalist API.            #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#        Copyright (C) 2025 - Global Mosquito Observations Dashboard           #
################################################################################

import requests
import json
import sys
import math

sys.path.insert(0, '../../translators/inaturalist') 
from utilities.json_translator import iNaturalistTranslator

class iNaturalistAPI:

	#
	# static attributes
	#

	api = 'https://api.inaturalist.org/v1/observations'
	params = {
		'd1': None,
		'd2': None,
		'page': 1,
		'per_page': 100,
		'taxon_id': 52134
	}

	#
	# getting methods
	#

	@staticmethod
	def get_url(url, params):

		"""
		Get a url from a base url and a set of query string parameters.

		Args:
			url (string): The base url.
			params (dict): The collection of query string parameters.

		Returns:
			string: The url.
		"""

		query_string = ''
		for param in params:
			value = params[param]
			if value != None:
				query_string += ('?' if query_string == '' else '&') + param + '=' + str(value)
		return url + query_string

	#
	# counting methods
	#

	@staticmethod
	def num_observations(start_date, end_date):

		"""
		Fetch number of observations within a date range.

		Args:
			api: The api to fetch data from
			start_date: The start of the date range.
			end_date: The end of the date range.

		Returns:
			integer: The number of observations.
		"""

		# make request
		#
		response = requests.get(iNaturalistAPI.get_url(iNaturalistAPI.api, iNaturalistAPI.params | {
			'd1': start_date,
			'd2': end_date
		}))

		# check for a response
		#
		if response is None:
			print("No results returned from API.")
			return 0

		# parse response
		#
		results = json.loads(response.text)

		# find number of observations
		#
		return int(results['total_results']) if results and 'total_results' in results else 0

	@staticmethod
	def num_pages(start_date, end_date):

		"""
		Fetch the number of pages within a date range.

		Args:
			api (string): The url of the api to use.
			start_date (string): The start of the date range.
			end_date (string): The end of the date range.

		Returns:
			int: The number of pages.
		"""

		num_observations = iNaturalistAPI.num_observations(start_date, end_date)
		return math.ceil(num_observations / iNaturalistAPI.params['per_page'])

	#
	# fetching methods
	#

	@staticmethod
	def fetch_page(start_date, end_date, page = 1):

		"""
		Fetch a page of observations within a date range.

		Args:
			api (string): The url of the api to use.
			start_date (string): The start of the date range.
			end_date (string): The end of the date range.
			page (int): The page of observations to get.
		Returns:
			array: The observation data.
		"""

		# make request
		#
		response = requests.get(iNaturalistAPI.get_url(iNaturalistAPI.api, iNaturalistAPI.params | {
			'd1': start_date,
			'd2': end_date,
			'page': page
		}))

		# check for a response
		#
		if response is None or response.text is None:
			print("No results returned from API.")
			return []

		if not response.text.startswith('{'):
			print "Error:", response.text
			return []

		# parse response
		#
		try:
			results = json.loads(response.text)

			# parse observations
			#
			observations = results['results'] if 'results' in results else []

			# transform data
			#
			return iNaturalistTranslator().translate_observations(observations)
		except:
			print("JSON Error:", reponse.text)
			return []

	@staticmethod
	def fetch_data(start_date, end_date):

		"""
		Fetch observations within a date range.

		Args:
			api (string): The url of the api to use.
			start_date (string): The start of the date range.
			end_date (string): The end of the date range.
		Returns:
			array: The observation data.
		"""

		values = []
		num_observations = iNaturalistAPI.num_observations(start_date, end_date)
		print("# of observations =", num_observations)

		num_pages = iNaturalistAPI.num_pages(start_date, end_date)
		if num_pages and num_pages > 0:
			for page in range(1, num_pages + 1):
				print("Fetching page", page, "of", num_pages)
				values += iNaturalistAPI.fetch_page(start_date, end_date, page = page)
		return values