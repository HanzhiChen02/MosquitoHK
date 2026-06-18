#!/usr/bin/env python3

import argparse
import json
import math
import os
import sys
from pathlib import Path

import mysql.connector
import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from config.region import HONG_KONG_BOUNDS, is_in_hong_kong


API_URL = 'https://api.inaturalist.org/v1/observations'
TAXON_ID = 52134
PER_PAGE = 200


def api_params(page):
	return {
		'taxon_id': TAXON_ID,
		'swlat': HONG_KONG_BOUNDS['min_latitude'],
		'swlng': HONG_KONG_BOUNDS['min_longitude'],
		'nelat': HONG_KONG_BOUNDS['max_latitude'],
		'nelng': HONG_KONG_BOUNDS['max_longitude'],
		'page': page,
		'per_page': PER_PAGE,
		'order_by': 'observed_on',
		'order': 'desc'
	}


def fetch_page(page):
	response = requests.get(API_URL, params=api_params(page), timeout=60)
	response.raise_for_status()
	return response.json()


def coordinates(observation):
	geojson = observation.get('geojson')
	if not geojson or not geojson.get('coordinates'):
		return None

	longitude, latitude = geojson['coordinates']
	return float(longitude), float(latitude)


def image_results(observation):
	results = []
	for photo in (observation.get('photos') or [])[:5]:
		if not photo.get('url'):
			continue
		results.append({
			'photo': {
				'url': photo['url'],
				'attribution': text(photo.get('attribution')),
				'license_code': text(photo.get('license_code'))
			}
		})
	return repr(results)


def text(value, max_length=255):
	if value is None:
		return None
	return ''.join(character for character in str(value) if ord(character) <= 0xffff)[:max_length]


def to_record(observation):
	location = coordinates(observation)
	if not location or not is_in_hong_kong(*location):
		return None

	longitude, latitude = location
	taxon = observation.get('taxon') or {}
	observed_at = observation.get('time_observed_at') or observation.get('observed_on')
	observation_url = observation.get('uri') or f"https://www.inaturalist.org/observations/{observation['id']}"

	return {
		'OBJECTID': observation['id'],
		'title': 'iNaturalist mosquito observation in Hong Kong',
		'dataStreamName': 'iNaturalist mosquito observations',
		'dataStreamDescription': text(observation.get('description')),
		'dataStreamObsType': 'occurrence',
		'dataStreamUniCategory': json.dumps({'taxon_id': TAXON_ID}),
		'observationProObsUID': str(observation.get('uuid') or observation['id']),
		'observationResCatObsPheTime': observed_at,
		'observationResCatObsResTime': observation.get('updated_at'),
		'observationResCatObsResult': json.dumps({'taxon': taxon.get('name')}),
		'obsResCatObsResult_Type': 'taxon',
		'Indentified_by_Human': taxon.get('name'),
		'observationResCatObsSubTime': observation.get('created_at'),
		'observationImaImaStatus': 'available' if observation.get('photos') else None,
		'observationImaImaResult': image_results(observation),
		'ObsCPCommonName': text(taxon.get('preferred_common_name')),
		'ObsTaxonName': text(taxon.get('name')),
		'omProcessLicLicName': observation.get('license_code'),
		'omProcessLicLicURI': observation_url,
		'omProcessLicLicAttSource': 'iNaturalist',
		'omProcessLicLicAttAggregator': text(observation.get('user', {}).get('login')),
		'omProcessProReference': observation_url,
		'omPrcoessResQuaQuaGrade': observation.get('quality_grade'),
		'observedProName': taxon.get('name'),
		'locationName': text(observation.get('place_guess')),
		'locationEncType': 'WGS84',
		'latitude': latitude,
		'longitude': longitude,
		'featureIntLocation': f'{latitude},{longitude}',
		'type': 'Point',
		'coordinates': repr([longitude, latitude]),
		'customEcCreatedOn': observation.get('created_at'),
		'x': longitude,
		'y': latitude,
		'country': 'Hong Kong'
	}


def connect():
	return mysql.connector.connect(
		host=os.getenv('DB_HOST', 'db'),
		port=int(os.getenv('DB_PORT', '3306')),
		user=os.getenv('DB_USERNAME', 'webuser'),
		password=os.getenv('DB_PASSWORD', 'password'),
		database=os.getenv('DB_DATABASE', 'mosquito_dashboard')
	)


def upsert(connection, record):
	cursor = connection.cursor()
	cursor.execute('SELECT id FROM inaturalist WHERE OBJECTID = %s LIMIT 1', (record['OBJECTID'],))
	existing = cursor.fetchone()

	columns = list(record.keys())
	values = [record[column] for column in columns]
	if existing:
		assignments = ','.join(f'{column} = %s' for column in columns)
		cursor.execute(f'UPDATE inaturalist SET {assignments} WHERE id = %s', values + [existing[0]])
	else:
		placeholders = ','.join(['%s'] * len(columns))
		cursor.execute(
			f"INSERT INTO inaturalist ({','.join(columns)}) VALUES ({placeholders})",
			values
		)
	cursor.close()
	return 'updated' if existing else 'inserted'


def main():
	parser = argparse.ArgumentParser(description='Import Hong Kong mosquito observations from iNaturalist.')
	parser.add_argument('--dry-run', action='store_true', help='Fetch and filter without writing to MySQL.')
	args = parser.parse_args()

	first_page = fetch_page(1)
	total_results = first_page.get('total_results', 0)
	num_pages = math.ceil(total_results / PER_PAGE)
	inserted = 0
	updated = 0
	filtered_out = 0
	connection = None if args.dry_run else connect()

	for page_number in range(1, num_pages + 1):
		payload = first_page if page_number == 1 else fetch_page(page_number)
		for observation in payload.get('results', []):
			record = to_record(observation)
			if record is None:
				filtered_out += 1
				continue
			if args.dry_run:
				inserted += 1
			elif upsert(connection, record) == 'inserted':
				inserted += 1
			else:
				updated += 1

		if connection:
			connection.commit()
		print(f'Processed page {page_number}/{num_pages}')

	if connection:
		connection.close()

	print(f'Candidate observations: {total_results}')
	print(f'Inside official Hong Kong district boundaries: {inserted + updated}')
	print(f'Inserted: {inserted}; updated: {updated}; outside polygons: {filtered_out}')


if __name__ == '__main__':
	main()
