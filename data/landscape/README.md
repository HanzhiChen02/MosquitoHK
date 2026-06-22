# Hong Kong landscape data, 2018–2023

This directory contains the Planning Department's **Land Utilization in Hong
Kong** datasets for 2018–2023 and web-ready derivatives used by the dashboard.

## Contents

- `source/`: the original Raster Grid and Traditional Chinese Statistics ZIP
  files downloaded from the Planning Department.
- `web/manifest.json`: source metadata, checksums, class definitions, annual
  statistics, image bounds, and attribution.
- `web/land-use-YYYY.png`: transparent WGS84 indexed-colour overlays generated
  from the official 10-metre EPSG:2326 TIFF grids.

## Rebuild

Install the build-only Python dependencies and run:

```bash
pip install -r scripts/requirements-landscape.txt
python scripts/build_landscape_data.py
```

To download missing source ZIP files from the official site:

```bash
python scripts/build_landscape_data.py --download
```

## Source and interpretation

Source: [Planning Department, HKSAR Government — Land Utilization in Hong
Kong](https://www.pland.gov.hk/pland_tc/info_serv/open_data/landu/).

The source grids have a spatial resolution of 10 metres. The Planning
Department describes the data as a broad-brush presentation for reference and
notes that land-use class definitions and methodology may be updated over
time. Direct year-to-year comparison may therefore not always be applicable.
