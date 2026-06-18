################################################################################
#                                                                              #
#                             json_translator.py                               #
#                                                                              #
################################################################################
#                                                                              #
#        This is a class for translating a iNaturalist data.                   #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#        Copyright (C) 2025 - Global Mosquito Observations Dashboard           #
################################################################################

from datetime import datetime
from datetime import date
import os

#
# globals
#

current = os.path.dirname(os.path.abspath(__file__))
schema = current + '/output_schema.txt'

#
# class
#

class iNaturalistTranslator:
	columns = []
	count = 0

	#
	# constructor
	#

	def __init__(self):
		global schema

		# read schema
		#
		with open(schema, 'r') as file:
			for line in file:
				column = line.replace(',', '').replace('REQUIRED', '').replace('MANDATORY', '').strip()
				if not column.startswith('//'):
					self.columns.append(column)

	#
	# converting methods
	#

	def object_to_array(self, object):

		"""
		Convert an object to an array of values.

		Args:
			object (dict): An associative array.

		Returns:
			array: The array of values.
		"""

		values = []
		for key in object:
			values.append(object[key])
		return values

	#
	# translating methods
	#

	def translate_value(self, key, observation):

		"""
		Translate a value with a particular name (key) from an observation.

		Args:
			key: the name of the desired field.
			observation (dict): The observation data.

		Returns:
			object: The translated value.
		"""

		#
		# casting functions
		#

		def val(data, name):
			if name in data:
				return data[name]
			else:
				return None

		def to_integer(value):
			if value == None:
				return 0
			elif isinstance(value, int):
				return value
			elif value == '':
				return 0
			else:
				return int(value)

		def to_float(value):
			if value == None:
				return 0
			elif isinstance(value, float):
				return value
			elif value == '':
				return 0
			else:
				return float(value)

		match key:

			case 'OBJECTID':
				return observation['id']

			case 'title':
				return 'Citizen·science·data·on·mosquitos·from·iNaturalist·with·additional·automated·ID'

			case 'description':
				return 'Data·is·generated·from·the·iNaturalist·database·filtered·by·Mosquitoes·and·quality·grade·before·additional·automated·identifications·are·added'

			case 'dataStreamName':
				return '·Research·grade·mosquito·species·occurrence·data·from·user·cell·phone'

			case 'dataStreamDescription':
				return 'All·species·occurrence·observations·from·a·particular·user·taken·with·a·sensor·or·manually'

			case 'dataStreamObsType':
				return 'category observation'

			case 'dataStreamUniCategory':
				return {
					"Type": "Annotations potentially including lifecycle phase",
					"Identified by Human": "Annotations potentially including lifecycle phase",
					"Identified by Machine": "Annotations potentially including lifecycle phase"
				}

			case 'observationProObsUID':
				return observation['uuid']

			case 'observationResCatObsPheTime':
				return observation['time_observed_at'] or ''

			case 'observationResCatObsResTime':
				return observation['time_observed_at'] or ''

			case 'observationResCatObsResult':
				return {
					'Type': '',
					'Human ID': observation['taxon']['name'],
					'Automated ID': observation['species_guess']
				}

			case 'obsResCatObsResult_Type':
				return 'adult'

			case 'Identified by Human' | 'Indentified by Human':
				return observation['taxon']['name']

			case 'Identified by Machine' | 'Identified by Machine':
				return ''

			case 'observationResCatObsSubTime':
				return ''

			case 'observationImaImaStatus':
				return 1 if observation['observation_photos'] else 0

			case 'observationImaImaResult':
				return observation['observation_photos']

			case 'observationConParameters':
				return {
					'captive': observation['captive'],
					'comments': observation['comments'],
					'time_zone_offset': observation['time_zone_offset'],
					'uri': observation['uri'],
					'icon_url': observation['user']['icon_url'],
					'sounds': observation['sounds']
				}

			case 'ObsCPCommonName':
				if 'preferred_common_name' in observation['taxon']:
					return observation['taxon']['preferred_common_name']

			case 'ObsTaxonName':
				taxon_name = ''
				if 'iconic_taxon_name' in observation['taxon']:
					return observation['taxon']['iconic_taxon_name']

			case 'Aegypti_Certainty':
				return ''

			case 'Tiger_Certainty':
				return ''

			case 'omProcessLicLicName':
				# return observation['taxon']['default_photo']['license_code']
				return ''

			case 'omProcessLicLicURI':
				return ''

			case 'omProcessLicLicAttSource':
				return ''

			case 'omProcessLicLicAttAggregator':
				return 'iNaturalist'

			case 'omProcessProType' | 'omPrcoessProType':
				return 'Sensor'

			case 'omProcessProReference':
				return 'https://www.inaturalist.org/pages/help'

			case 'omProcessResQuaValStatus' | 'omPrcoessResQuaValStatus':
				return 1

			case 'omProcessResQuaValMethod' | 'omPrcoessResQuaValMethod':
				return 'Human expert validation'

			case 'omProcessResQuaValResult' | 'omPrcoessResQuaValResult':
				return 1

			case 'omProcessResQuaQuaGrade' | 'omPrcoessResQuaQuaGrade':
				return observation['quality_grade']

			case 'observedProName':
				return 'Species occurrence'

			case 'observedProDescription':
				return 'Whether a species is observed at a location'

			case 'observedProDefinition':
				return 'https://www.sciencedirect.com/topics/earth-and-planetary-sciences/species-occurrence'

			case 'sensorName':
				return observation['uuid']

			case 'sensorDescription':
				return 'Observation take by mobile phone of user: ' + observation['uuid']

			case 'sensorEncType':
				return 'NC'

			case 'locationName':
				return 'Anonymous location'

			case 'locationDescription':
				return 'location.name'

			case 'locationEncType':
				return 'GeoJSON Point'

			case 'latitude':
				location = observation['location']
				return to_float(location.split(',')[0]) if location else 0

			case 'longitude':
				location = observation['location']
				return to_float(location.split(',')[1]) if location else 0

			case 'thingName':
				return 'sensor.name'

			case 'thingDescription':
				return 'sensor.description'

			case 'featureIntName':
				return 'location.name'

			case 'featureIntDescription':
				return 'location.description'

			case 'featureIntEncType':
				return 'GeoJSON Point'

			case 'featureIntLocation':
				return 'latitude, longitude'

			case 'type':
				return 'FeatureCollection'

			case 'coordinates':
				location = observation['location']
				if location:
					latitude = location.split(',')[0] if location else ''
					longitude = location.split(',')[1] if location else ''
					return '[' + longitude + ',' + latitude + ']'

			case 'customEcCreatedOn':
				# return str(datetime.now())
				return str(date.today())

			case 'x':
				location = observation['location']
				return to_float(location.split(',')[1]) if location else None

			case 'y':
				location = observation['location']
				return to_float(location.split(',')[0]) if location else None

		return ''

	def translate_observation(self, observation):

		"""
		Translate an observation.

		Args:
			observation (dict): The observation data.

		Returns:
			object: The set of values.
		"""

		values = {}
		for column in self.columns:
			value = self.translate_value(column, observation)
			values[column] = value
		return values

	def translate_observations(self, observations):

		"""
		Translate an array of observations.

		Args:
			observations (array): The array of observations.

		Returns:
			object: array of sets of values.
		"""

		values = []
		if len(observations) > 0:
			columns = observations[0]
			for index in range(1, len(observations)):
				observation = observations[index]
				values.append(self.translate_observation(observation))
		return values