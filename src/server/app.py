################################################################################
#                                                                              #
#                                    app.py                                    #
#                                                                              #
################################################################################
#                                                                              #
#        This is a web server for managing GPU resource information.           #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
################################################################################
#     Copyright (C) 2025, Data Science Institute, University of Wisconsin      #
################################################################################

import os
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from controllers.inaturalist_controller import iNaturalistController
from controllers.digitomy_controller import DigitomyController
from controllers.fehd_gravidtrap_controller import FehdGravidtrapController
from controllers.hko_environment_controller import HkoEnvironmentController
from controllers.country_controller import CountryController
from controllers.observation_controller import ObservationController
from config.region import HONG_KONG_BOUNDS

################################################################################
#                                initialization                                #
################################################################################

# load environment settings
#
load_dotenv()

# configure database
#
db = {
	'host': os.getenv('DB_HOST'),
	'port': os.getenv('DB_PORT'),
	'username': os.getenv('DB_USERNAME'),
	'password': os.getenv('DB_PASSWORD'),
	'database': os.getenv('DB_DATABASE')	
}

app = Flask(__name__)
CORS(app)

def get_filter_options():
	return {
		'countries': request.args.get('countries').split(',') if request.args.get('countries') is not None else None,
		'before': request.args.get('before'),
		'after': request.args.get('after'),
		'metric': request.args.get('metric'),
		'genera': request.args.get('genera').split(',') if request.args.get('genera') is not None else None,
		'species': request.args.get('species').split(',') if request.args.get('species') is not None else None
	}

def validate_filter_options(options):
	error = ObservationController.validate_date_options(options)
	if error:
		return {'error': error}, 400
	return None

################################################################################
#                                    routes                                    #
################################################################################

#
# get routes
#

@app.get('/')
def get_home():

	"""
	Get API home message.

	Return
		html
	"""

	return "<h1>Welcome to the Hong Kong Mosquito Watch API.</h1>"

@app.get('/region')
def get_region():
	return {
		'name': 'Hong Kong',
		'bounds': HONG_KONG_BOUNDS,
		'boundary': '/data/boundaries/hksar_18_district_boundary.json',
		'boundary_source': 'Home Affairs Department, HKSAR Government'
	}

@app.get('/observations/<source>')
def get_observations(source: str):

	"""
	Get observation information.

	Return
		array: The list of observations.
	"""

	# get query string parameters
	#
	options = get_filter_options()
	error = validate_filter_options(options)
	if error:
		return error

	# get data
	#
	match (source):
		case 'inaturalist':
			return iNaturalistController.get_all(db, options)
		case 'digitomy':
			return DigitomyController.get_all(db, options)
		case 'fehd-gravidtrap':
			return FehdGravidtrapController.get_all(db, options)
		case _:
			return {'error': 'Observation source not found.'}, 404


@app.get('/observations/fehd-gravidtrap/areas')
def get_fehd_gravidtrap_areas():
	options = get_filter_options()
	error = validate_filter_options(options)
	if error:
		return error

	return FehdGravidtrapController.get_area_geojson(db, options)

@app.get('/observations/<source>/<id>')
def get_observation(source: str, id: str):

	"""
	Get observation information.

	Return
		object: The observation data.
	"""

	match (source):
		case 'inaturalist':
			return iNaturalistController.get_index(db, id)
		case 'digitomy':
			return DigitomyController.get_index(db, id)
		case 'fehd-gravidtrap':
			return FehdGravidtrapController.get_index(db, id)
		case _:
			return {'error': 'Observation source not found.'}, 404

@app.get('/environment/hko')
def get_hko_environment():
	options = get_filter_options()
	error = validate_filter_options(options)
	if error:
		return error

	return HkoEnvironmentController.get_all(db, options)

@app.get('/environment/hko/areas')
def get_hko_environment_areas():
	options = get_filter_options()
	error = validate_filter_options(options)
	if error:
		return error

	return HkoEnvironmentController.get_area_geojson(db, options)

@app.get('/environment/hko/timeline')
def get_hko_environment_timeline():
	options = get_filter_options()
	error = validate_filter_options(options)
	if error:
		return error

	return HkoEnvironmentController.get_timeline(db, options)

@app.get('/observations/<source>/num')
def get_num_observations(source: str):

	"""
	Get number of observations.

	Return
		int: The number of observations.
	"""

	# get query string parameters
	#
	options = get_filter_options()
	error = validate_filter_options(options)
	if error:
		return error

	# get counts
	#
	match (source):
		case 'inaturalist':
			return iNaturalistController.get_num(db, options)
		case 'digitomy':
			return DigitomyController.get_num(db, options)
		case 'fehd-gravidtrap':
			return FehdGravidtrapController.get_num(db, options)
		case _:
			return {'error': 'Observation source not found.'}, 404

@app.get('/observations/<source>/timeline')
def get_observations_timeline(source: str):
	options = get_filter_options()

	match (source):
		case 'inaturalist':
			return iNaturalistController.get_timeline(db, options)
		case 'fehd-gravidtrap':
			return FehdGravidtrapController.get_timeline(db, options)
		case 'fehd-gravidtrap-area':
			return FehdGravidtrapController.get_timeline(db, options)
		case _:
			return {'error': 'Timeline is not available for this source.'}, 404

@app.get('/countries')
def get_countries():

	"""
	Get list of countries.

	Return
		array: The list of countries.
	"""

	return CountryController.get_all(db)

@app.get('/countries/num')
def get_num_countries():

	"""
	Get number of countries.

	Return
		array: The number of countries.
	"""

	return CountryController.get_num(db)

@app.get('/genera')
def get_genera():

	"""
	Get list of genera.

	Return
		array: The list of genera (from iNaturalist).
	"""

	indices = request.args.get('indices')
	if indices:
		return iNaturalistController.get_genera_by_indices(db, indices)
	return iNaturalistController.get_genera(db)

@app.get('/species')
def get_species():

	"""
	Get list of species.

	Return
		array: The list of species (from iNaturalist).
	"""

	return iNaturalistController.get_species(db)

################################################################################
#                                     main                                     #
################################################################################

if __name__ == '__main__':

	if os.getenv('PORT') == 443:
		app.run(host=os.getenv('HOST'), port=443, ssl_context=(os.getenv('SSL_CERT'), os.getenv('SSL_KEY')), threaded=True, debug=True)
	else:
		app.run(host=os.getenv('HOST'), port=os.getenv('PORT'), threaded=True, debug=True)
