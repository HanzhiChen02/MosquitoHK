################################################################################
#                                                                              #
#                         hko_environment_controller.py                        #
#                                                                              #
################################################################################

from copy import deepcopy
from math import inf

from models.hko_environment_observation import HkoEnvironmentObservation
from controllers.observation_controller import ObservationController
from config.region import DISTRICT_BOUNDARIES

class HkoEnvironmentController(ObservationController):

	METRICS = {
		'mean_temperature': {
			'column': 'mean_temperature',
			'label': 'Mean temperature',
			'unit': '°C'
		},
		'total_rainfall': {
			'column': 'total_rainfall',
			'label': 'Total rainfall',
			'unit': 'mm'
		},
		'mean_relative_humidity': {
			'column': 'mean_relative_humidity',
			'label': 'Mean relative humidity',
			'unit': '%'
		}
	}

	@staticmethod
	def get_metric(options: object):
		metric = options.get('metric') or 'mean_temperature'
		if metric not in HkoEnvironmentController.METRICS:
			return None
		return metric

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
	def add_latest_date_filter(db: object, query: str, column: str):
		table = HkoEnvironmentObservation().table
		observed_on = ObservationController.get_value(
			db,
			'SELECT MAX(observed_on) FROM ' + table + ' WHERE ' + column + ' IS NOT NULL'
		)
		if observed_on:
			query = ObservationController.add_condition(query, "observed_on = '" + observed_on + "'")
		return query

	@staticmethod
	def get_polygon_centroid(coordinates: list):
		ring = coordinates[0]
		if not ring:
			return None
		longitudes = [point[0] for point in ring]
		latitudes = [point[1] for point in ring]
		return {
			'x': sum(longitudes) / len(longitudes),
			'y': sum(latitudes) / len(latitudes)
		}

	@staticmethod
	def get_feature_centroid(feature: object):
		geometry = feature.get('geometry', {})
		coordinates = geometry.get('coordinates', [])
		if geometry.get('type') == 'Polygon':
			return HkoEnvironmentController.get_polygon_centroid(coordinates)
		if geometry.get('type') == 'MultiPolygon' and coordinates:
			return HkoEnvironmentController.get_polygon_centroid(coordinates[0])
		return None

	@staticmethod
	def distance_squared(a: object, b: object):
		return (float(a['x']) - float(b['x'])) ** 2 + (float(a['y']) - float(b['y'])) ** 2

	@staticmethod
	def get_station_stats(db: object, options: object, column: str):
		table = HkoEnvironmentObservation().table
		query = (
			'SELECT station_code, station_name, x, y, district, MIN(observed_on), MAX(observed_on), AVG(' + column + '), ' +
			'AVG(mean_temperature), AVG(max_temperature), AVG(min_temperature), ' +
			'AVG(total_rainfall), AVG(mean_relative_humidity), COUNT(*) FROM ' + table +
			' WHERE x IS NOT NULL AND y IS NOT NULL AND ' + column + ' IS NOT NULL'
		)

		if options.get('after') or options.get('before'):
			query = HkoEnvironmentController.add_date_filters(query, options)
		else:
			observed_on = ObservationController.get_value(
				db,
				'SELECT MAX(observed_on) FROM ' + table + ' WHERE ' + column + ' IS NOT NULL'
			)
			if observed_on:
				query = ObservationController.add_condition(query, "observed_on = '" + observed_on + "'")

		query += ' GROUP BY station_code, station_name, x, y, district'
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data

		stations = []
		for row in data:
			start_date = str(row[5]) if row[5] is not None else None
			end_date = str(row[6]) if row[6] is not None else None
			period = start_date if start_date == end_date else (start_date or '') + ' to ' + (end_date or '')
			stations.append({
				'station_code': row[0],
				'station_name': row[1],
				'x': row[2],
				'y': row[3],
				'district': row[4],
				'period': period,
				'value': round(float(row[7]), 1) if row[7] is not None else None,
				'mean_temperature': round(float(row[8]), 1) if row[8] is not None else None,
				'max_temperature': round(float(row[9]), 1) if row[9] is not None else None,
				'min_temperature': round(float(row[10]), 1) if row[10] is not None else None,
				'total_rainfall': round(float(row[11]), 1) if row[11] is not None else None,
				'mean_relative_humidity': round(float(row[12]), 1) if row[12] is not None else None,
				'count': int(row[13]) if row[13] is not None else 0
			})
		return stations

	@staticmethod
	def get_all(db: object, options: object):
		metric = HkoEnvironmentController.get_metric(options)
		if metric is None:
			return {'error': 'Environment metric not found.'}, 404

		table = HkoEnvironmentObservation().table
		column = HkoEnvironmentController.METRICS[metric]['column']
		query = (
			'SELECT id,observed_on,station_code,station_name,x,y,district,' + column +
			',mean_temperature,max_temperature,min_temperature,total_rainfall,mean_relative_humidity,source_document FROM ' + table +
			' WHERE ' + column + ' IS NOT NULL'
		)
		query = ObservationController.add_hong_kong_filter(query)

		if options.get('after') or options.get('before'):
			query = HkoEnvironmentController.add_date_filters(query, options)
		else:
			query = HkoEnvironmentController.add_latest_date_filter(db, query, column)

		query += ' ORDER BY observed_on, station_code'
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data

		observations = []
		for item in data:
			observations.append({
				'id': item[0],
				'observed_on': str(item[1]) if item[1] is not None else None,
				'station_code': item[2],
				'station_name': item[3],
				'x': item[4],
				'y': item[5],
				'district': item[6],
				'metric': metric,
				'value': item[7],
				'mean_temperature': item[8],
				'max_temperature': item[9],
				'min_temperature': item[10],
				'total_rainfall': item[11],
				'mean_relative_humidity': item[12],
				'source_document': item[13]
			})
		return observations

	@staticmethod
	def get_area_geojson(db: object, options: object):
		metric = HkoEnvironmentController.get_metric(options)
		if metric is None:
			return {'error': 'Environment metric not found.'}, 404

		table = HkoEnvironmentObservation().table
		column = HkoEnvironmentController.METRICS[metric]['column']
		query = (
			'SELECT district, MIN(observed_on), MAX(observed_on), AVG(' + column + '), ' +
			'AVG(mean_temperature), AVG(max_temperature), AVG(min_temperature), ' +
			'AVG(total_rainfall), AVG(mean_relative_humidity), COUNT(*), COUNT(DISTINCT station_code) FROM ' + table +
			' WHERE district IS NOT NULL AND ' + column + ' IS NOT NULL'
		)

		if options.get('after') or options.get('before'):
			query = HkoEnvironmentController.add_date_filters(query, options)
		else:
			observed_on = ObservationController.get_value(
				db,
				'SELECT MAX(observed_on) FROM ' + table + ' WHERE ' + column + ' IS NOT NULL'
			)
			if observed_on:
				query = ObservationController.add_condition(query, "observed_on = '" + observed_on + "'")

		query += ' GROUP BY district'
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data
		station_stats = HkoEnvironmentController.get_station_stats(db, options, column)
		if isinstance(station_stats, tuple):
			return station_stats

		by_district = {}
		for row in data:
			start_date = str(row[1]) if row[1] is not None else None
			end_date = str(row[2]) if row[2] is not None else None
			period = start_date if start_date == end_date else (start_date or '') + ' to ' + (end_date or '')
			by_district[row[0]] = {
				'period': period,
				'value': round(float(row[3]), 1) if row[3] is not None else None,
				'mean_temperature': round(float(row[4]), 1) if row[4] is not None else None,
				'max_temperature': round(float(row[5]), 1) if row[5] is not None else None,
				'min_temperature': round(float(row[6]), 1) if row[6] is not None else None,
				'total_rainfall': round(float(row[7]), 1) if row[7] is not None else None,
				'mean_relative_humidity': round(float(row[8]), 1) if row[8] is not None else None,
				'count': int(row[9]) if row[9] is not None else 0,
				'station_count': int(row[10]) if row[10] is not None else 0,
				'spatial_method': 'Average of HKO stations spatially matched to this district'
			}

		geojson = deepcopy(DISTRICT_BOUNDARIES)
		for feature in geojson['features']:
			properties = feature.get('properties', {})
			district = properties.get('District') or properties.get('district') or properties.get('ENAME') or properties.get('CNAME')
			stats = by_district.get(district, {})
			if not stats and station_stats:
				centroid = HkoEnvironmentController.get_feature_centroid(feature)
				nearest = None
				nearest_distance = inf
				for station in station_stats:
					distance = HkoEnvironmentController.distance_squared(centroid, station) if centroid else inf
					if distance < nearest_distance:
						nearest = station
						nearest_distance = distance
				if nearest:
					stats = {
						'period': nearest.get('period'),
						'value': nearest.get('value'),
						'mean_temperature': nearest.get('mean_temperature'),
						'max_temperature': nearest.get('max_temperature'),
						'min_temperature': nearest.get('min_temperature'),
						'total_rainfall': nearest.get('total_rainfall'),
						'mean_relative_humidity': nearest.get('mean_relative_humidity'),
						'count': nearest.get('count', 0),
						'station_count': 1,
						'matched_station': nearest.get('station_name'),
						'matched_station_code': nearest.get('station_code'),
						'spatial_method': 'Nearest HKO station fallback; no station with this metric is located in this district'
					}
			properties.update({
				'district': district,
				'metric': metric,
				'label': HkoEnvironmentController.METRICS[metric]['label'],
				'unit': HkoEnvironmentController.METRICS[metric]['unit'],
				'value': stats.get('value'),
				'period': stats.get('period'),
				'mean_temperature': stats.get('mean_temperature'),
				'max_temperature': stats.get('max_temperature'),
				'min_temperature': stats.get('min_temperature'),
				'total_rainfall': stats.get('total_rainfall'),
				'mean_relative_humidity': stats.get('mean_relative_humidity'),
				'count': stats.get('count', 0),
				'station_count': stats.get('station_count', 0),
				'matched_station': stats.get('matched_station'),
				'matched_station_code': stats.get('matched_station_code'),
				'boundary_level': 'district',
				'boundary_source': 'Home Affairs Department, HKSAR Government',
				'data_source': 'Hong Kong Observatory station metadata and daily climatological data',
				'spatial_method': stats.get('spatial_method')
			})
			feature['properties'] = properties

		return geojson

	@staticmethod
	def get_timeline(db: object, options: object):
		metric = HkoEnvironmentController.get_metric(options)
		if metric is None:
			return {'error': 'Environment metric not found.'}, 404

		table = HkoEnvironmentObservation().table
		column = HkoEnvironmentController.METRICS[metric]['column']
		query = (
			'SELECT observed_on, COUNT(*), AVG(' + column + '), MIN(' + column + '), MAX(' + column + ') FROM ' + table +
			' WHERE ' + column + ' IS NOT NULL GROUP BY observed_on ORDER BY observed_on'
		)
		data = ObservationController.get_all(db, query)
		if isinstance(data, tuple):
			return data

		buckets = []
		total = 0
		for observed_on, count, average_value, min_value, max_value in data:
			total += count
			buckets.append({
				'period': str(observed_on) if observed_on is not None else None,
				'count': count,
				'average_value': round(float(average_value), 1) if average_value is not None else None,
				'min_value': round(float(min_value), 1) if min_value is not None else None,
				'max_value': round(float(max_value), 1) if max_value is not None else None
			})

		return {
			'interval': 'day',
			'metric': metric,
			'label': HkoEnvironmentController.METRICS[metric]['label'],
			'unit': HkoEnvironmentController.METRICS[metric]['unit'],
			'total': total,
			'buckets': buckets
		}
