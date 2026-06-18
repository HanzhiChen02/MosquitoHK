################################################################################
#                                                                              #
#                                   model.py                                   #
#                                                                              #
################################################################################
#                                                                              #
#        This is an abstract base class for models that can be stored to       #
#        a database.                                                           #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#     Copyright (C) 2025, Data Science Institute, University of Wisconsin      #
################################################################################

import requests
import json

class Model:

	#
	# attributes
	#

	attributes = []

	#
	# constructor
	#

	def __init__(self, attributes):

		"""
		Creates a new model with the specified attributes.

		Parameters:
			attributes (dict): The model's attributes
		"""

		# set attributes
		#
		self.attributes = attributes;

	#
	# querying methods
	#

	def has(self, attribute):

		"""
		Tests if this model has this attribute.

		Returns:
			boolean
		"""

		return attribute in self.attributes and self.attributes[attribute] != None and self.attributes[attribute] != ''

	def exists(self, db):

		"""
		Tests whether this model exists in the database.

		Parameters:
			db (object) - The database to store the model in.
		Returns:
			boolean
		"""

		return self.has('id') and self.find(db) != None

	def find(self, db):

		"""
		Finds this model in the database.

		Parameters:
			db (object) - The database to store the model in.
		Returns:
			Object
		"""

		cursor = db.cursor()

		# create prepared statement
		#
		query = 'SELECT * FROM ' + self.table + ' WHERE id = %s'

		# execute prepared statement
		#
		cursor.execute(query, [self.get('id')])

		return cursor.fetchall()

	#
	# getting methods
	#

	def get(self, attribute):

		"""
		Gets this model's attribute.

		Parameters:
			attribute (string): The attribute to get.
		Returns:
			object
		"""

		if (not self.has(attribute)):
			return
		return self.attributes[attribute]

	#
	# setting methods
	#

	def set(self, key, value):

		"""
		Sets one of this model's attributes.

		Parameters:
			key (string): The name of the attribute to set.
			value: The value of the attribute to set.
		Returns:
			Model
		"""

		self.attributes[key] = value
		return self

	def set_all(self, attributes):

		"""
		Sets all of this model's attributes.

		Parameters:
			attributes (dict): The attributes (keys and values) to set.
		Returns:
			Model
		"""

		self.attributes = attributes
		return self

	#
	# ajax methods
	#

	def fetch(self):

		"""
		Fetches this model from the server.

		Returns:
			Model
		"""

		request = requests.get(self.url())
		if (request.status_code == 200):
			self.attributes = json.loads(request.text)
		else:
			print("Error - could not fetch model from " + self.url())
		return self

	#
	# saving methods
	#

	def save(self, db):

		"""
		Stores this model in the database.

		Parameters:
			db (object) - The database to store the model in.
		Returns:
			Object
		"""

		# check for data
		#
		if (self.attributes == None):
			print("Can not store uninitialized model.")
			return

		# insert or update model
		#
		if (not self.exists(db)):
			self.insert(db)
		else:
			self.update(db)

	def insert(self, db):

		"""
		Inserts this model in the database.

		Parameters:
			db (object) - The database to store the model in.
		Returns:
			Object
		"""

		# make sure we have a db to insert into
		#
		if not db:
			return

		# add new row to database
		#
		cursor = db.cursor()
		attributes = self.to_array()

		# create list of keys
		#
		keys = list(attributes.keys())
		keys_str = ''
		count = 0
		for key in keys:
			if ' ' in key:
				key = key.replace(' ', '_')
			keys_str += str(key)
			count += 1
			if (count < len(keys)):
				keys_str += ', '

		# create list of values
		#
		values = list(attributes.values())
		values_str = ''
		count = 0
		for value in values:
			values_str += '%s'
			count += 1
			if (count < len(values)):
				values_str += ', '

		# create prepared statement
		#
		query = 'INSERT INTO ' + self.table + ' (' + keys_str + ') VALUES (' + values_str + ')'

		# clean values
		#
		for i in range(len(values)):
			if values[i] == '':
				values[i] = None
			elif isinstance(values[i], dict):
				values[i] = (json.dumps(values[i]))
			elif isinstance(values[i], str):
				values[i] = values[i].replace('·', ' ').strip()
			elif isinstance(values[i], float):
				values[i] = round(values[i], 6)
			elif isinstance(values[i], list):
				values[i] = str(values[i])

			# truncate string, if necessary
			#
			if isinstance(values[i], str):
				values[i] = values[i].encode('ascii', 'ignore')[:4096]
		
		# execute prepared statement
		#
		cursor.execute(query, values)
		db.commit()

		# set id to last row id
		#
		self.set('id', cursor.lastrowid)

	def update(self, db, attributes = None):

		"""
		Updates this model in the database.

		Parameters:
			db (object) - The database to store the model in.
		Returns:
			Object
		"""

		# get attributes to save
		#
		if (not attributes):
			attributes = self.to_array()

		# add new row to database
		#
		cursor = db.cursor()

		# create list of assignments
		#
		keys = list(attributes.keys())
		assigns_str = ''
		count = 0
		for key in keys:
			key_str = str(key)
			value = attributes[key]
			if (count > 0):
				assigns_str += ', '
			value_str = ("'" + str(value).encode(encoding="UTF-8", errors="ignore").decode('UTF-8').replace("'", "`").replace("\\", "/") + "'") if value != None else 'NULL'
			count += 1
			assigns_str += key_str + ' = ' + value_str

		# update db
		#
		query = 'UPDATE ' + self.table + ' SET ' + assigns_str + ' WHERE id = ' + str(attributes['id'])
		cursor.execute(query)
		db.commit()

	def update_not_null(self, db):

		"""
		Updates this model in the database.

		Parameters:
			db (object) - The database to store the model in.
		Returns:
			Object
		"""

		# add new row to database
		#
		cursor = db.cursor()
		attributes = self.to_array()

		# create list of assignments
		#
		keys = list(attributes.keys())
		assigns_str = ''
		count = 0
		for key in keys:
			key_str = str(key)
			value = self.get(key)
			if value != '' and value != None:
				if (count > 0):
					assigns_str += ', '
				value_str = ("'" + str(value).encode(encoding="UTF-8", errors="ignore").decode('UTF-8').replace("'", "`") + "'") if value != None else 'NULL'
				count += 1
				assigns_str += key_str + ' = ' + value_str

		# update db
		#
		if assigns_str != '':
			query = 'UPDATE ' + self.table + ' SET ' + assigns_str + ' WHERE id = ' + str(self.get('id'))
			cursor.execute(query)
			db.commit()

	#
	# converting methods
	#

	def to_array(self):

		"""
		Get this model's attributes as an array.

		Returns:
			array
		"""

		return self.attributes

	#
	# deleting methods
	#

	def delete(self, db):

		"""
		Deletes this model from the database.

		Parameters:
			db (object) - The database to store the model in.
			table (string) - The name of the database table to store the model in.
		Returns:
			Object
		"""

		cursor = db.cursor()
		query = 'DELETE FROM ' + self.table + ' WHERE id = ' + str(self.get('id'))
		cursor.execute(query)
		db.commit()
		return self

	#
	# printing methods
	#

	def print(self):

		"""
		Prints this model's attributes

		Returns:
			None
		"""

		print(self.attributes)