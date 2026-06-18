################################################################################
#                                                                              #
#                                scrape_api.sh                                 #
#                                                                              #
################################################################################
#                                                                              #
#        This is a shell script for scraping from the iNaturalist API.         #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.txt', which is part of this source code distribution.        #
#                                                                              #
################################################################################
#        Copyright (C) 2025 - Global Mosquito Observations Dashboard           #
################################################################################

function scrape_year() {
	local year="$1"
	echo "Year: $year"

	# scrape first 11 months
	#
	for month in {1..11}; do
		next_month=$((month + 1))
		month_two_digits=$(printf "%02d" "$month")
		next_month_two_digits=$(printf "%02d" "$next_month")
		start="$year-$month_two_digits-01"
		end="$year-$next_month_two_digits-01"
		python3 scrape_to_db.py "$start" "$end"
	done

	# scrape last month
	#
	local next_year=$((year + 1))
	python3 scrape_to_db.py "$year-12-01" "$next_year-01-01"
}

function scrape_years() {
	start="$1"
	end="$2"

	for year in $(seq $start $end); do
		scrape_year $year
	done
}

# scrape_past_3_months
scrape_years 2015 2025