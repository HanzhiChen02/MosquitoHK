#!/usr/bin/env python3

import argparse
import csv
import hashlib
import io
import json
import tempfile
import urllib.request
import zipfile
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.transform import array_bounds
from rasterio.warp import Resampling, calculate_default_transform, reproject


YEARS = list(range(2018, 2024))
DOWNLOAD_ROOT = (
    'https://www.pland.gov.hk/pland_tc/info_serv/open_data/landu/downloads'
)

LAND_USE_CLASSES = [
    (1, 'Private Residential', '私人住宅', '#A64D4D', 'Residential'),
    (2, 'Public Residential', '公營房屋', '#A60000', 'Residential'),
    (3, 'Rural Settlement', '鄉郊居所', '#CC804D', 'Residential'),
    (11, 'Commercial / Business and Office', '商業／商貿和辦公室', '#FF0000', 'Commercial'),
    (21, 'Industrial Land', '工業用地', '#8000FF', 'Industrial'),
    (22, 'Industrial Estates / Science and Technology Parks', '工業邨／科技園', '#804DFF', 'Industrial'),
    (23, 'Warehouse and Open Storage', '貨倉和露天貯物', '#4D4DFF', 'Industrial'),
    (31, 'Government, Institutional and Community Facilities', '政府、機構和社區設施', '#33FFFF', 'Institutional / Open Space'),
    (32, 'Open Space and Recreation', '休憩和康樂', '#00FF00', 'Institutional / Open Space'),
    (41, 'Roads and Transport Facilities', '道路和運輸設施', '#FFFF66', 'Transportation'),
    (42, 'Railways', '鐵路', '#000000', 'Transportation'),
    (43, 'Airport', '機場', '#FFE6CC', 'Transportation'),
    (44, 'Port Facilities', '港口設施', '#C29CD6', 'Transportation'),
    (51, 'Cemeteries and Crematoria', '墳場／殯殮設施', '#FFFF00', 'Other Urban or Built-up Land'),
    (52, 'Utilities', '公用事業設施', '#FFA600', 'Other Urban or Built-up Land'),
    (53, 'Vacant Land / Construction in Progress', '空置／正在進行建築工程的土地', '#FFFFFF', 'Other Urban or Built-up Land'),
    (54, 'Others', '其他', '#FFCC4D', 'Other Urban or Built-up Land'),
    (61, 'Agricultural Land', '農地', '#80A64D', 'Agriculture'),
    (62, 'Fish Ponds / Gei Wais', '魚塘／基圍', '#00CCFF', 'Agriculture'),
    (71, 'Woodland', '林地', '#80FF4D', 'Vegetation'),
    (72, 'Shrubland', '灌叢', '#A6FF8C', 'Vegetation'),
    (73, 'Grassland', '草地', '#CCFFA6', 'Vegetation'),
    (74, 'Mangrove / Swamp', '紅樹林／沼澤', '#FF4DA6', 'Vegetation'),
    (81, 'Badland', '劣地', '#8080A6', 'Barren Land'),
    (83, 'Rocky Shore', '岩岸', '#804D80', 'Barren Land'),
    (91, 'Reservoirs', '水塘', '#BFFFFF', 'Water Bodies'),
    (92, 'Streams and Nullahs', '河道和明渠', '#99F2FF', 'Water Bodies'),
]


def source_paths(source_dir, year):
    return (
        source_dir / f'LUMHK_RasterGrid_{year}.zip',
        source_dir / f'LUHK{year}_tc.zip',
    )


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def download_file(url, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return
    print(f'Downloading {url}')
    urllib.request.urlretrieve(url, destination)


def download_sources(source_dir):
    for year in YEARS:
        raster_zip, statistics_zip = source_paths(source_dir, year)
        download_file(
            f'{DOWNLOAD_ROOT}/LUMHK_RasterGrid_{year}.zip',
            raster_zip,
        )
        download_file(
            f'{DOWNLOAD_ROOT}/LUHK{year}_tc.zip',
            statistics_zip,
        )


def hex_to_rgb(value):
    value = value.lstrip('#')
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def palette_values():
    palette = [0] * (256 * 3)
    transparency = [0] * 256
    for code, _name, _name_zh, color, _group in LAND_USE_CLASSES:
        red, green, blue = hex_to_rgb(color)
        palette[code * 3:code * 3 + 3] = [red, green, blue]
        transparency[code] = 255
    return palette, bytes(transparency)


def find_member(archive, suffix, excluded=()):
    for name in archive.namelist():
        lower_name = name.lower()
        if lower_name.endswith(suffix.lower()) and not any(
            term in lower_name for term in excluded
        ):
            return name
    raise FileNotFoundError(f'Could not find {suffix} in {archive.filename}')


def build_web_raster(raster_zip, output_path):
    with tempfile.TemporaryDirectory() as temp_dir:
        with zipfile.ZipFile(raster_zip) as archive:
            tif_member = find_member(archive, '.tif')
            archive.extract(tif_member, temp_dir)
        tif_path = Path(temp_dir) / tif_member

        with rasterio.open(tif_path) as source:
            transform, width, height = calculate_default_transform(
                source.crs,
                'EPSG:4326',
                source.width,
                source.height,
                *source.bounds,
            )
            source_values = source.read(1)
            source_values = np.where(source_values > 0, source_values, 0).astype(
                np.uint8
            )
            destination = np.zeros((height, width), dtype=np.uint8)
            reproject(
                source=source_values,
                destination=destination,
                src_transform=source.transform,
                src_crs=source.crs,
                src_nodata=0,
                dst_transform=transform,
                dst_crs='EPSG:4326',
                dst_nodata=0,
                resampling=Resampling.nearest,
            )

        palette, transparency = palette_values()
        image = Image.fromarray(destination, mode='P')
        image.putpalette(palette)
        image.info['transparency'] = transparency
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(output_path, optimize=True, compress_level=9)

        west, south, east, north = array_bounds(height, width, transform)
        return {
            'width': width,
            'height': height,
            'bounds': [[south, west], [north, east]],
        }


def decode_csv(data):
    for encoding in ('utf-8-sig', 'big5', 'cp950'):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode('utf-8', errors='replace')


def clean_cell(value):
    return value.replace('\t', '').strip()


def parse_number(value):
    value = clean_cell(value)
    if not value:
        return None
    number = float(value)
    return int(number) if number.is_integer() else number


def parse_statistics(statistics_zip):
    with zipfile.ZipFile(statistics_zip) as archive:
        data_member = find_member(
            archive,
            '.csv',
            excluded=('description',),
        )
        text = decode_csv(archive.read(data_member))

    rows = []
    reader = csv.reader(io.StringIO(text))
    next(reader, None)
    for code_info, row in zip(LAND_USE_CLASSES, reader):
        row = [clean_cell(cell) for cell in row]
        while len(row) < 5:
            row.append('')
        code, name, name_zh, color, group = code_info
        rows.append({
            'code': code,
            'group': group,
            'name': name,
            'name_zh': name_zh,
            'color': color,
            'area_km2': parse_number(row[2]),
            'percentage': parse_number(row[3]),
            'note_zh': row[4],
        })
    return rows


def build_manifest(source_dir, output_dir):
    yearly_data = []
    for year in YEARS:
        print(f'Processing {year}')
        raster_zip, statistics_zip = source_paths(source_dir, year)
        output_path = output_dir / f'land-use-{year}.png'
        raster_metadata = build_web_raster(raster_zip, output_path)
        yearly_data.append({
            'year': year,
            'image': f'land-use-{year}.png',
            'source_raster': f'../source/{raster_zip.name}',
            'source_statistics': f'../source/{statistics_zip.name}',
            'source_raster_url': f'{DOWNLOAD_ROOT}/{raster_zip.name}',
            'source_statistics_url': f'{DOWNLOAD_ROOT}/{statistics_zip.name}',
            'source_raster_sha256': sha256_file(raster_zip),
            'source_statistics_sha256': sha256_file(statistics_zip),
            'statistics': parse_statistics(statistics_zip),
            **raster_metadata,
        })

    manifest = {
        'title': 'Land Utilization in Hong Kong, 2018–2023',
        'source': 'Planning Department, HKSAR Government',
        'source_page': (
            'https://www.pland.gov.hk/pland_tc/info_serv/open_data/landu/'
        ),
        'crs': 'EPSG:4326',
        'source_crs': 'EPSG:2326',
        'source_resolution_metres': 10,
        'warning': (
            'Land-use class definitions and methodology may change over time; '
            'direct year-to-year comparison may not be applicable.'
        ),
        'classes': [
            {
                'code': code,
                'name': name,
                'name_zh': name_zh,
                'color': color,
                'group': group,
            }
            for code, name, name_zh, color, group in LAND_USE_CLASSES
        ],
        'years': yearly_data,
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )


def main():
    parser = argparse.ArgumentParser(
        description='Build web-ready Hong Kong land-utilization layers.'
    )
    parser.add_argument(
        '--source-dir',
        type=Path,
        default=Path('data/landscape/source'),
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path('data/landscape/web'),
    )
    parser.add_argument(
        '--download',
        action='store_true',
        help='Download the official source ZIP files before building.',
    )
    args = parser.parse_args()

    if args.download:
        download_sources(args.source_dir)
    build_manifest(args.source_dir, args.output_dir)


if __name__ == '__main__':
    main()
