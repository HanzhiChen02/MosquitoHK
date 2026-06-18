################################################################################
#                                                                              #
#                          inaturalist_controller.py                           #
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

from array import array
from models.observation import Observation
from models.inaturalist_observation import iNaturalistObservation
from controllers.observation_controller import ObservationController

class iNaturalistController(ObservationController):

	#
	# getting methods
	#

	@staticmethod
	def get_all(db: object, options: object):

		# create query
		#
		table = iNaturalistObservation().table
		query = 'SELECT ' + ','.join(Observation.fields) + ' FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		# add filters
		#
		if 'countries' in options and options['countries'] is not None:
			return [];
		if 'after' in options or 'before' in options:
			query = ObservationController.add_date_filter(query, 'observationResCatObsPheTime', options['after'], options['before'])
		if 'genera' in options and options['genera'] is not None:
			query = ObservationController.add_genera_filter(query, 'Indentified_by_Human', iNaturalistController.get_genera_by_indices(db, options['genera']))
		if 'species' in options and options['species'] is not None:
			query = ObservationController.add_species_filter(query, 'Indentified_by_Human', iNaturalistController.get_species_by_indices(db, options['species']))

		# get data
		#
		observations = []
		data = ObservationController.get_hong_kong_observations(db, query)
		for item in data:
			observations.append(Observation.to_values(item))
		return observations

	@staticmethod
	def get_index(db: object, id: str):

		# create query
		#
		table = iNaturalistObservation().table
		query = 'SELECT ' + ','.join(iNaturalistObservation.fields) + ' FROM ' + table + " WHERE id = " + str(id)
		query = ObservationController.add_hong_kong_filter(query)

		# get data
		#
		data = ObservationController.get_one(db, query)
		if data is None:
			return {'error': 'Hong Kong observation not found'}, 404
		observation = iNaturalistObservation.to_values(data)
		if not ObservationController.is_hong_kong_observation(observation):
			return {'error': 'Hong Kong observation not found'}, 404
		return observation

	@staticmethod
	def get_num(db: object, options: object):

		# create query
		#
		table = iNaturalistObservation().table
		query = 'SELECT x,y FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		# add filters
		#
		if 'after' in options or 'before' in options:
			query = ObservationController.add_date_filter(query, 'observationResCatObsPheTime', options['after'], options['before'])
		if 'genera' in options and options['genera'] is not None:
			query = ObservationController.add_genera_filter(query, 'Indentified_by_Human', iNaturalistController.get_genera_by_indices(db, options['genera']))
		if 'species' in options and options['species'] is not None:
			query = ObservationController.add_species_filter(query, 'Indentified_by_Human', iNaturalistController.get_species_by_indices(db, options['species']))

		# get value
		#
		return ObservationController.get_hong_kong_count(db, query)

	@staticmethod
	def get_timeline(db: object, options: object):

		table = iNaturalistObservation().table
		query = 'SELECT x,y,observationResCatObsPheTime FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		if 'genera' in options and options['genera'] is not None:
			query = ObservationController.add_genera_filter(query, 'Indentified_by_Human', iNaturalistController.get_genera_by_indices(db, options['genera']))
		if 'species' in options and options['species'] is not None:
			query = ObservationController.add_species_filter(query, 'Indentified_by_Human', iNaturalistController.get_species_by_indices(db, options['species']))

		return ObservationController.get_hong_kong_timeline(db, query)

	#
	# genus getting methods
	#

	@staticmethod
	def get_genera(db: object):
		table = iNaturalistObservation().table
		return ObservationController.get_genera(db, table)

	@staticmethod
	def get_genera_by_indices(db: object, indices: array):
		table = iNaturalistObservation().table
		return ObservationController.get_genera_by_indices(db, table, indices)

	#
	# species getting methods
	#

	@staticmethod
	def get_species(db: object):

		# connect to database
		#
		connection = ObservationController.connect(db)
		if connection is None:
			return 'Could not connect to database', 500

		# create query
		#
		table = iNaturalistObservation().table
		query = 'SELECT DISTINCT Indentified_by_human FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		# execute query
		#
		cursor = connection.cursor()
		cursor.execute(query)
		data = cursor.fetchall()
		cursor.close()

		# get list of species
		#
		species = [array[0] for array in data]

		species2 = []
		for item in species:
			if ' ' in item:
				if not item in species2:
					species2.append(item)
		species2.sort()

		# return results
		#
		return species2

	@staticmethod
	def get_species_by_indices(db: object, indices: array):
		if indices is None:
			return []
		array = []
		species = iNaturalistController.get_species(db)
		indes = 0
		for index in indices:
			array.append(species[int(index) - 1])
		return array
