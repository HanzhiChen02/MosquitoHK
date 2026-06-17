################################################################################
#                                                                              #
#                       hko_environment_observation.py                         #
#                                                                              #
################################################################################

from models.observation import Observation

class HkoEnvironmentObservation(Observation):

	table = 'hko_environment_daily'

	fields = [
		'id',
		'observed_on',
		'station_code',
		'station_name',
		'x',
		'y',
		'district',
		'mean_temperature',
		'max_temperature',
		'min_temperature',
		'total_rainfall',
		'mean_relative_humidity',
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
		for key in HkoEnvironmentObservation.fields:
			fields[key] = HkoEnvironmentObservation.to_value(key, data[count])
			count += 1
		return fields
