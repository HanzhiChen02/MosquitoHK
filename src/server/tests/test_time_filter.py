import unittest
from datetime import datetime

from controllers.observation_controller import ObservationController


class TimeFilterTests(unittest.TestCase):

	def test_adds_half_open_date_range(self):
		query = ObservationController.add_date_filter(
			'SELECT * FROM observations',
			'observed_at',
			'2026-01-01',
			'2026-02-01'
		)

		self.assertIn("observed_at >= '2026-01-01'", query)
		self.assertIn("observed_at < '2026-02-01'", query)

	def test_rejects_invalid_date(self):
		error = ObservationController.validate_date_options({
			'after': 'June 1, 2026',
			'before': None
		})

		self.assertEqual(error, 'Dates must use YYYY-MM-DD format.')

	def test_rejects_reversed_date_range(self):
		error = ObservationController.validate_date_options({
			'after': '2026-02-01',
			'before': '2026-01-01'
		})

		self.assertEqual(error, 'The after date must be earlier than the before date.')

	def test_creates_month_key(self):
		self.assertEqual(
			ObservationController.month_key(datetime(2026, 6, 15, 12, 30)),
			'2026-06'
		)

	def test_empty_date_has_no_month_key(self):
		self.assertIsNone(ObservationController.month_key(None))


if __name__ == '__main__':
	unittest.main()
