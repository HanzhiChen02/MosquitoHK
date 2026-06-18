################################################################################
#                                                                              #
#                         fehd_gravidtrap_controller.py                        #
#                                                                              #
################################################################################

from models.observation import Observation
from copy import deepcopy
from models.fehd_gravidtrap_observation import FehdGravidtrapObservation
from controllers.observation_controller import ObservationController
from config.region import DISTRICT_BOUNDARIES

class FehdGravidtrapController(ObservationController):

	@staticmethod
	def add_date_filters(query: str, options: object):
		if 'after' in options or 'before' in options:
			return ObservationController.add_date_filter(
				query,
				'observed_on',
				options.get('after'),
				options.get('before')
			)
		return query

	@staticmethod
	def add_latest_period_filter(db: object, query: str):
		table = FehdGravidtrapObservation().table
		period = ObservationController.get_value(db, 'SELECT MAX(period) FROM ' + table)
		if period:
			query = ObservationController.add_condition(query, "period = '" + period + "'")
		return query

	@staticmethod
	def get_all(db: object, options: object):
		table = FehdGravidtrapObservation().table
		query = 'SELECT id,x,y,agi_percent FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)

		if options.get('after') or options.get('before'):
			query = FehdGravidtrapController.add_date_filters(query, options)
		else:
			query = FehdGravidtrapController.add_latest_period_filter(db, query)

		query += ' ORDER BY district, survey_area'
		observations = []
		data = ObservationController.get_hong_kong_observations(db, query)
		for item in data:
			observations.append({
				'id': item[0],
				'x': item[1],
				'y': item[2],
				'agi_percent': item[3]
			})
		return observations

	@staticmethod
	def normalize_district_name(name: str):
		if name is None:
			return None
		aliases = {
			'Central and Western': 'Central & Western',
			'Central/Western': 'Central & Western'
		}
		return aliases.get(name, name)

	@staticmethod
	def get_area_period(db: object, options: object):
		table = FehdGravidtrapObservation().table
		query = 'SELECT MAX(period) FROM ' + table
		if options.get('after') or options.get('before'):
			query = FehdGravidtrapController.add_date_filters(query, options)
		return ObservationController.get_value(db, query)

	@staticmethod
	def get_area_geojson(db: object, options: object):
		table = FehdGravidtrapObservation().table
		query = (
			'SELECT district, COUNT(*), AVG(agi_percent), MAX(agi_percent) FROM ' + table +
			' WHERE district IS NOT NULL AND agi_percent IS NOT NULL'
		)
		if options.get('after') or options.get('before'):
			query = FehdGravidtrapController.add_date_filters(query, options)
		else:
			query = FehdGravidtrapController.add_latest_period_filter(db, query)
		query += ' GROUP BY district'

		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data

		period = FehdGravidtrapController.get_area_period(db, options)
		by_district = {}
		for district, count, average_agi, max_agi in data:
			key = FehdGravidtrapController.normalize_district_name(district)
			by_district[key] = {
				'count': count,
				'average_agi_percent': round(float(average_agi), 1) if average_agi is not None else None,
				'max_agi_percent': round(float(max_agi), 1) if max_agi is not None else None
			}

		features = []
		for feature in DISTRICT_BOUNDARIES['features']:
			area = deepcopy(feature)
			district = area['properties'].get('District')
			stats = by_district.get(district, {
				'count': 0,
				'average_agi_percent': None,
				'max_agi_percent': None
			})
			area['properties'] = {
				'district': district,
				'period': period,
				'count': stats['count'],
				'average_agi_percent': stats['average_agi_percent'],
				'max_agi_percent': stats['max_agi_percent'],
				'boundary_level': 'district',
				'boundary_source': 'Home Affairs Department, HKSAR Government',
				'data_source': 'FEHD Gravidtrap Index, aggregated by district'
			}
			features.append(area)

		return {
			'type': 'FeatureCollection',
			'features': features
		}

	@staticmethod
	def get_index(db: object, id: str):
		table = FehdGravidtrapObservation().table
		query = 'SELECT ' + ','.join(FehdGravidtrapObservation.fields) + ' FROM ' + table + " WHERE id = " + str(id)
		query = ObservationController.add_hong_kong_filter(query)
		data = ObservationController.get_one(db, query)
		if data is None:
			return {'error': 'FEHD gravidtrap record not found'}, 404
		return FehdGravidtrapObservation.to_values(data)

	@staticmethod
	def get_num(db: object, options: object):
		table = FehdGravidtrapObservation().table
		query = 'SELECT x,y FROM ' + table
		query = ObservationController.add_hong_kong_filter(query)
		if options.get('after') or options.get('before'):
			query = FehdGravidtrapController.add_date_filters(query, options)
		else:
			query = FehdGravidtrapController.add_latest_period_filter(db, query)
		return ObservationController.get_hong_kong_count(db, query)

	@staticmethod
	def get_timeline(db: object, options: object):
		table = FehdGravidtrapObservation().table
		query = (
			'SELECT period, COUNT(*), AVG(agi_percent), MAX(agi_percent) FROM ' + table +
			' WHERE agi_percent IS NOT NULL GROUP BY period ORDER BY period'
		)
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data

		buckets = []
		total = 0
		for period, count, average_agi, max_agi in data:
			total += count
			buckets.append({
				'period': period,
				'count': count,
				'average_agi_percent': round(float(average_agi), 1) if average_agi is not None else None,
				'max_agi_percent': round(float(max_agi), 1) if max_agi is not None else None
			})

		return {
			'interval': 'month',
			'metric': 'agi_percent',
			'total': total,
			'buckets': buckets
		}
