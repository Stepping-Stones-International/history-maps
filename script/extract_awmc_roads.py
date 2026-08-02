"""Clip and simplify the Ancient World Mapping Centre's road network.

A second, independent reconstruction to set beside Itiner-e: drawn from the
Barrington Atlas of the Greek and Roman World, coarser but carrying the
classical road names Itiner-e leaves out. Licensed ODbL:

    https://github.com/AWMC/geodata   (Cultural-Data/roads/roads.geojson)

Take that file and run:

    python3 script/extract_awmc_roads.py roads.geojson \\
      app/assets/data/awmc-roads.geojson

Major_or_M reads 1 for a major road: 100 of the 117 named viae carry it,
which is what the field name promises. Known_or_a is carried through as
given, without being leaned on.
"""

import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])

from extract_itinere_roads import simplify


def main(source, destination, west, south, east, north, tolerance):
    sys.setrecursionlimit(10000)
    collection = json.load(open(source))

    features = []
    vertices_in = vertices_out = 0

    for feature in collection["features"]:
        geometry = feature["geometry"]
        if geometry["type"] not in ("LineString", "MultiLineString"):
            continue

        parts = (
            [ geometry["coordinates"] ] if geometry["type"] == "LineString"
            else geometry["coordinates"]
        )

        lines = []
        for line in parts:
            points = [ (point[0], point[1]) for point in line ]
            if not any(west <= lon <= east and south <= lat <= north for lon, lat in points):
                continue

            vertices_in += len(points)
            kept = simplify(points, tolerance)
            vertices_out += len(kept)
            lines.append([ [ round(lon, 5), round(lat, 5) ] for lon, lat in kept ])

        if not lines:
            continue

        given = feature["properties"]
        properties = {
            "id": given.get("OBJECTID"),
            "name": given.get("Name") or None,
            "kind": "Main Road" if str(given.get("Major_or_M")) == "1" else "Secondary Road"
        }
        if given.get("timeperiod"):
            properties["period"] = given["timeperiod"]
        if given.get("Known_or_a") is not None:
            properties["known"] = str(given["Known_or_a"])

        features.append({
            "type": "Feature",
            "properties": properties,
            "geometry": (
                { "type": "LineString", "coordinates": lines[0] } if len(lines) == 1
                else { "type": "MultiLineString", "coordinates": lines }
            )
        })

    with open(destination, "w") as out:
        json.dump({ "type": "FeatureCollection", "features": features }, out, separators=(",", ":"))

    print(f"{len(features)} roads, {vertices_in} vertices in, {vertices_out} out")


if __name__ == "__main__":
    # The same window as the Itiner-e extract, so the two lie over each other.
    main(sys.argv[1], sys.argv[2], west=8.0, south=24.0, east=50.0, north=46.0, tolerance=0.002)
