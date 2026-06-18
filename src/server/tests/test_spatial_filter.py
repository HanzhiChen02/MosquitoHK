import unittest

from config.region import HONG_KONG_BOUNDS, is_in_hong_kong
from controllers.observation_controller import ObservationController


class SpatialFilterTests(unittest.TestCase):

	def test_adds_hong_kong_bounds_to_query(self):
		query = ObservationController.add_hong_kong_filter('SELECT id,x,y FROM observations')

		self.assertIn("x BETWEEN 113.825 AND 114.45", query)
		self.assertIn("y BETWEEN 22.15 AND 22.58", query)
		self.assertEqual(query.count('WHERE'), 1)

	def test_appends_bounds_after_existing_condition(self):
		query = ObservationController.add_hong_kong_filter(
			"SELECT id,x,y FROM observations WHERE source = 'test'"
		)

		self.assertIn("source = 'test' AND x BETWEEN", query)
		self.assertEqual(query.count('WHERE'), 1)

	def test_removes_trailing_semicolon_before_filter(self):
		query = ObservationController.add_hong_kong_filter('SELECT COUNT(*) FROM observations;')

		self.assertNotIn('; WHERE', query)
		self.assertEqual(HONG_KONG_BOUNDS['min_latitude'], 22.15)

	def test_official_boundary_contains_hong_kong_location(self):
		self.assertTrue(is_in_hong_kong(114.1694, 22.3193))

	def test_official_boundary_excludes_location_outside_districts(self):
		self.assertFalse(is_in_hong_kong(113.84, 22.56))


if __name__ == '__main__':
	unittest.main()
