################################################################################
#                                                                              #
#                       fehd_gravidtrap_observation.py                         #
#                                                                              #
################################################################################

from models.observation import Observation

class FehdGravidtrapObservation(Observation):

	table = 'fehd_gravidtrap'

	fields = [
		'id',
		'year',
		'month',
		'period',
		'observed_on',
		'region',
		'district',
		'survey_area',
		'area_code',
		'map_url',
		'x',
		'y',
		'agi_percent',
		'adi',
		'is_partial',
		'source_document'
	]

	def __init__(self, attributes = None):
		self.attributes = attributes

	@staticmethod
	def to_value(key: str, data: object):
		return data

	@staticmethod
	def to_values(data: object):
		fields = {}
		count = 0
		for key in FehdGravidtrapObservation.fields:
			fields[key] = FehdGravidtrapObservation.to_value(key, data[count])
			count += 1
		return fields
