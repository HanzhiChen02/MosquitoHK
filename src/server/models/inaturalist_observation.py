################################################################################
#                                                                              #
#                          inaturalist_observation.py                          #
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

import json
from models.observation import Observation

class iNaturalistObservation(Observation):

	#
	# attributes
	#

	fields = [
		'id',
		'OBJECTID',
		'title',
		'dataStreamName',
		'dataStreamDescription',
		'dataStreamObsType',
		'dataStreamUniCategory',
		'observationProObsUID',
		'observationResCatObsPheTime',
		'observationResCatObsResTime',
		'observationResCatObsResult',
		'obsResCatObsResult_Type',
		'Indentified_by_Human',
		'Identified_by_Machine',
		'observationResCatObsSubTime',
		'observationImaImaStatus',
		'observationImaImaResult',
		'ObsCPCommonName',
		'ObsTaxonName',
		'Aegypti_Certainty',
		'Tiger_Certainty',
		'omProcessLicLicName',
		'omProcessLicLicURI',
		'omProcessLicLicAttSource',
		'omProcessLicLicAttAggregator',
		'omPrcoessProType',
		'omProcessProReference',
		'omPrcoessResQuaValStatus',
		'omPrcoessResQuaValMethod',
		'omPrcoessResQuaValResult',
		'omPrcoessResQuaQuaGrade',
		'observedProName',
		'observedProDescription',
		'observedProDefinition',
		'sensorName',
		'sensorDescription',
		'sensorEncType',
		'locationName',
		'locationDescription',
		'locationEncType',
		'latitude',
		'longitude',
		'thingName',
		'thingDescription',
		'featureIntName',
		'featureIntDescription',
		'featureIntEncType',
		'featureIntLocation',
		'type',
		'coordinates',
		'customEcCreatedOn',
		'x',
		'y',
		'country'
	]

	#
	# casting
	#

	casts = {
		'objects': [
			'observationImaImaResult',
			'coordinates'
		],

		'objects2': [
			'dataStreamUniCategory',
			'observationResCatObsResult'
		]
	}

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
		self.table = 'inaturalist'
		self.attributes = attributes;

	#
	# conversion methods
	#

	@staticmethod
	def to_value(key: str, data: object):
		if key in iNaturalistObservation.casts['objects']:
			return Observation.to_object(data)
		elif key in iNaturalistObservation.casts['objects2']:
			return Observation.to_object2(data)
		else:
			return data

	@staticmethod
	def to_values(data: object):
		fields = {}
		count = 0
		for key in iNaturalistObservation.fields:
			fields[key] = iNaturalistObservation.to_value(key, data[count])
			count += 1
		return fields