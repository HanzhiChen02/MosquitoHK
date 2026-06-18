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

# scrape first 6 months of 2025
#
python3 scrape_to_db.py '2025-01-01' '2025-02-01'