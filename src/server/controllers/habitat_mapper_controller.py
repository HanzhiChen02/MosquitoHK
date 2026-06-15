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

from models.observation import Observation
from models.habitat_mapper_observation import HabitatMapperObservation
from controllers.observation_controller import ObservationController
from controllers.country_controller import CountryController

class HabitatMapperController(ObservationController):

	#
	# getting methods
	#

	@staticmethod
	def get_all(db: object, options: object):
		
		# create query
		#
		table = HabitatMapperObservation().table
		query = 'SELECT ' + ','.join(Observation.fields) + ' FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		# add filters
		#
		if 'countries' in options and options['countries'] is not None:
			query = ObservationController.add_countries_filter(query, 'mhm_siteName', CountryController.get_by_indices(db, options['countries']))
		if 'after' in options or 'before' in options:
			query = ObservationController.add_date_filter(query, 'mhm_measuredDate', options['after'], options['before'])
		if 'genera' in options and options['genera'] is not None:
			return []
		if 'species' in options and options['species'] is not None:
			return []

		# get data
		#
		observations = []
		data = ObservationController.get_hong_kong_observations(db, query)
		if data != 'Could not connect to database':
			for item in data:
				observations.append(Observation.to_values(item))
		return observations

	@staticmethod
	def get_index(db: object, id: str):

		# create query
		#
		table = HabitatMapperObservation().table
		query = 'SELECT ' + ','.join(HabitatMapperObservation.fields) + ' FROM ' + table + " WHERE id = " + str(id)
		query = ObservationController.add_hong_kong_filter(query)

		# get data
		#
		data = ObservationController.get_one(db, query)
		if data is None:
			return {'error': 'Hong Kong observation not found'}, 404
		observation = HabitatMapperObservation.to_values(data)
		if not ObservationController.is_hong_kong_observation(observation):
			return {'error': 'Hong Kong observation not found'}, 404
		return observation

	@staticmethod
	def get_num(db: object, options: object):

		# create query
		#
		table = HabitatMapperObservation().table
		query = 'SELECT x,y FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		# add filters
		#
		if 'after' in options or 'before' in options:
			query = ObservationController.add_date_filter(query, 'mhm_measuredDate', options['after'], options['before'])
		if 'genera' in options and options['genera'] is not None:
			return []
		if 'species' in options and options['species'] is not None:
			return []

		# get value
		#
		return ObservationController.get_hong_kong_count(db, query)
