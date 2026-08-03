"""Clip and simplify the Itiner-e Roman road network for the map.

The source is the Itiner-e static dataset, 14,769 segments of the road network
as it stood around AD 150, licensed CC BY 4.0:

    https://zenodo.org/records/17122148   (DOI 10.5281/zenodo.17122148)

Take itinere_roads.gpkg from that record and run:

    python3 script/extract_itinere_roads.py itinere_roads.gpkg \\
      app/assets/data/roman-roads.geojson

which keeps the segments touching the New Testament world — Italy through
Mesopotamia — and thins them to what this map's zooms can show. Everything is
plain Python: the GeoPackage is a SQLite file, and its geometry is read
directly rather than through GDAL, whose install here is broken.

Dates come across as they are given. Only a few hundred segments carry one,
9999 stands for "unknown", and the construction period is a free-text reign,
so this is a record of what the dataset says rather than a datable network.
"""

import json
import math
import sqlite3
import struct
import sys

A = 6378137.0
E = 0.081819190842621  # WGS84 first eccentricity


def to_lonlat(x, y):
    """Inverse EPSG:3395 (WGS 84 / World Mercator)."""
    lon = math.degrees(x / A)
    t = math.exp(-y / A)
    phi = math.pi / 2 - 2 * math.atan(t)
    for _ in range(8):
        sin = E * math.sin(phi)
        phi = math.pi / 2 - 2 * math.atan(t * ((1 - sin) / (1 + sin)) ** (E / 2))
    return lon, math.degrees(phi)


ENVELOPE_SIZES = { 0: 0, 1: 32, 2: 48, 3: 48, 4: 64 }


def read_envelope(blob):
    """The header's own bounding box, still in projected metres."""
    flags = blob[3]
    code = (flags >> 1) & 7
    if code == 0:
        return None

    order = "<" if flags & 1 else ">"
    west, east, south, north = struct.unpack_from(order + "dddd", blob, 8)
    return west, south, east, north


def read_wkb_lines(blob):
    """Lines out of a GeoPackage blob: header, then WKB."""
    offset = 8 + ENVELOPE_SIZES[(blob[3] >> 1) & 7]

    def read(fmt, at):
        return struct.unpack_from(fmt, blob, at)

    # Itiner-e stores its lines with a z, which is read past and dropped.
    def points(at, order, stride):
        count, = read(order + "I", at)
        at += 4
        coords = []
        for _ in range(count):
            coords.append(read(order + "dd", at))
            at += stride
        return coords, at

    def geometry(at):
        order = "<" if blob[at] == 1 else ">"
        kind, = read(order + "I", at + 1)
        dimensions = 2 + (1 if kind // 1000 in (1, 3) else 0) + (1 if kind // 1000 in (2, 3) else 0)

        if kind % 1000 == 2:
            coords, at = points(at + 5, order, dimensions * 8)
            return [ coords ], at

        if kind % 1000 == 5:
            count, = read(order + "I", at + 5)
            at += 9
            lines = []
            for _ in range(count):
                part, at = geometry(at)
                lines.extend(part)
            return lines, at

        raise ValueError(f"unexpected geometry type {kind}")

    lines, _ = geometry(offset)
    return lines


def simplify(points, tolerance):
    """Douglas-Peucker, on lon/lat degrees."""
    if len(points) < 3:
        return points

    (x0, y0), (x1, y1) = points[0], points[-1]
    dx, dy = x1 - x0, y1 - y0
    span = dx * dx + dy * dy

    worst, index = -1.0, 0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        if span == 0:
            distance = math.hypot(x - x0, y - y0)
        else:
            t = max(0.0, min(1.0, ((x - x0) * dx + (y - y0) * dy) / span))
            distance = math.hypot(x - (x0 + t * dx), y - (y0 + t * dy))
        if distance > worst:
            worst, index = distance, i

    if worst <= tolerance:
        return [ points[0], points[-1] ]

    return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)


SOURCE = {
    "name": "Itiner-e: the digital atlas of ancient roads",
    "citation": "Brughmans, Pazout, de Soto and Bjerregaard Vahlstrup, Itiner-e, "
                "static version 2024",
    "url": "https://doi.org/10.5281/zenodo.17122148",
    "licence": "CC BY 4.0",
    "licence_url": "https://creativecommons.org/licenses/by/4.0/"
}

UNKNOWN = 9999.0


def year(value):
    """9999 is the dataset's stand-in for an unknown date."""
    return None if value is None or value == UNKNOWN else int(value)


def main(source, destination, west, south, east, north, tolerance):
    sys.setrecursionlimit(10000)
    db = sqlite3.connect(source)
    db.text_factory = lambda raw: raw.decode("utf-8", "replace")
    rows = db.execute(
        'select fid, geom, Name, Type, Lower_Date, Upper_Date, Cons_per_e '
        'from itinere_roads_simplify'
    )

    features = []
    vertices_in = vertices_out = 0

    for fid, blob, name, kind, lower, upper, built in rows:
        # Cheap rejection first: the header's box, reprojected, is two points
        # rather than the whole line.
        box = read_envelope(blob)
        if box:
            (box_west, box_south), (box_east, box_north) = to_lonlat(box[0], box[1]), to_lonlat(box[2], box[3])
            if box_east < west or box_west > east or box_north < south or box_south > north:
                continue

        lines = []
        for line in read_wkb_lines(blob):
            lonlat = [ to_lonlat(x, y) for x, y in line ]
            if not any(west <= lon <= east and south <= lat <= north for lon, lat in lonlat):
                continue

            vertices_in += len(lonlat)
            kept = simplify(lonlat, tolerance)
            vertices_out += len(kept)
            lines.append([ [ round(lon, 5), round(lat, 5) ] for lon, lat in kept ])

        if not lines:
            continue

        properties = { "id": fid, "name": name or None, "kind": kind }
        if year(lower) is not None:
            properties["from"] = year(lower)
        if year(upper) is not None:
            properties["to"] = year(upper)
        if built:
            properties["built"] = built

        features.append({
            "type": "Feature",
            "properties": properties,
            "geometry": (
                { "type": "LineString", "coordinates": lines[0] } if len(lines) == 1
                else { "type": "MultiLineString", "coordinates": lines }
            )
        })

    collection = {
        "type": "FeatureCollection",
        "source": {
            **SOURCE,
            "processing": f"Clipped to {west},{south},{east},{north} and simplified to "
                          f"{tolerance} degrees by script/extract_itinere_roads.py"
        },
        "features": features
    }
    with open(destination, "w") as out:
        json.dump(collection, out, separators=(",", ":"))

    print(f"{len(features)} segments, {vertices_in} vertices in, {vertices_out} out")


if __name__ == "__main__":
    # Italy and Sicily through Mesopotamia, Egypt up to the Black Sea, and
    # about 200m of detail — finer than this map can draw at its deepest zoom.
    main(sys.argv[1], sys.argv[2], west=8.0, south=24.0, east=50.0, north=46.0, tolerance=0.002)
