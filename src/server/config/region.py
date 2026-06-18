################################################################################
#                                                                              #
#                                  region.py                                   #
#                                                                              #
################################################################################

import json
import os

HONG_KONG_BOUNDS = {
	'min_longitude': 113.825,
	'max_longitude': 114.45,
	'min_latitude': 22.15,
	'max_latitude': 22.58
}

BOUNDARY_PATH = os.getenv(
	'HONG_KONG_BOUNDARY_PATH',
	os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data', 'boundaries', 'hksar_18_district_boundary.json')
)


def load_district_boundaries():
	with open(BOUNDARY_PATH, encoding='utf-8') as boundary_file:
		return json.load(boundary_file)


def point_in_ring(longitude, latitude, ring):
	inside = False
	previous = ring[-1]

	for current in ring:
		x1, y1 = previous
		x2, y2 = current
		if (y1 > latitude) != (y2 > latitude):
			intersection = (x2 - x1) * (latitude - y1) / (y2 - y1) + x1
			if longitude < intersection:
				inside = not inside
		previous = current

	return inside


def point_in_polygon(longitude, latitude, coordinates):
	if not point_in_ring(longitude, latitude, coordinates[0]):
		return False

	return not any(point_in_ring(longitude, latitude, ring) for ring in coordinates[1:])


DISTRICT_BOUNDARIES = load_district_boundaries()


def is_in_hong_kong(longitude, latitude):
	if longitude is None or latitude is None:
		return False

	try:
		longitude = float(longitude)
		latitude = float(latitude)
	except (TypeError, ValueError):
		return False

	if not (
		HONG_KONG_BOUNDS['min_longitude'] <= longitude <= HONG_KONG_BOUNDS['max_longitude'] and
		HONG_KONG_BOUNDS['min_latitude'] <= latitude <= HONG_KONG_BOUNDS['max_latitude']
	):
		return False

	for feature in DISTRICT_BOUNDARIES['features']:
		if point_in_polygon(longitude, latitude, feature['geometry']['coordinates']):
			return True

	return False
