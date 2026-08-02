"""Pull routes out of ORBIS v2's route network.

ORBIS is Stanford's geospatial network model of the Roman world. Its published
route layer carries roads, river routes and sea routes together, told apart by
the `t` property:

    coastal    hugging the shore, port to port
    overseas   open-water crossings
    ferry      short hops across a strait
    road       land routes
    upstream   } river routes, one entry per direction
    downstream }

Which kinds to keep, and whether to clip, are given on the command line.

Source (MIT licensed at the repository level):

    https://github.com/emeeks/orbis_v2   (base_routes.geojson)

Take that file and run:

    # every sea lane, uncut
    python3 script/extract_orbis_routes.py base_routes.geojson \\
      app/assets/data/orbis-sea-routes.geojson

    # the land roads of northern Mesopotamia
    python3 script/extract_orbis_routes.py base_routes.geojson \\
      app/assets/data/orbis-mesopotamia-roads.geojson road 37,29,49,38

The sea lanes are not clipped: they are few and cheap, and cutting them at the
edge of the New Testament window would drop the western Mediterranean, where
Paul meant to sail to Spain. Nothing is simplified — an ORBIS route is drawn
as the link it is, so there is nothing to thin. Coordinates are rounded to
five decimals, about a metre.

A clip keeps whole any route that touches the box, so a road is not cut off
mid-link at the edge.

Note that `o_mesh.sql` in the ORBIS repository is a different thing: the
directional routing mesh used to compute travel against wind and current. It
is the cost grid behind the model, not the route layer, so it is not used here.
"""

import json
import sys

MARITIME = ("coastal", "overseas", "ferry")


def rounded(points):
    return [ [ round(point[0], 5), round(point[1], 5) ] for point in points ]


def touches(lines, bounds):
    if not bounds:
        return True

    west, south, east, north = bounds
    return any(
        west <= point[0] <= east and south <= point[1] <= north
        for line in lines for point in line
    )


def main(source, destination, kinds, bounds):
    collection = json.load(open(source))

    features = []
    for feature in collection["features"]:
        kind = feature["properties"].get("t")
        if kind not in kinds:
            continue

        geometry = feature["geometry"]
        if geometry["type"] == "LineString":
            lines = [ geometry["coordinates"] ]
        elif geometry["type"] == "MultiLineString":
            lines = geometry["coordinates"]
        else:
            continue

        if not touches(lines, bounds):
            continue

        shape = (
            { "type": "LineString", "coordinates": rounded(lines[0]) } if len(lines) == 1
            else { "type": "MultiLineString", "coordinates": [ rounded(l) for l in lines ] }
        )

        features.append({
            "type": "Feature",
            "properties": { "id": feature["properties"].get("gid"), "kind": kind },
            "geometry": shape
        })

    with open(destination, "w") as out:
        json.dump({ "type": "FeatureCollection", "features": features }, out, separators=(",", ":"))

    counts = {}
    for feature in features:
        kind = feature["properties"]["kind"]
        counts[kind] = counts.get(kind, 0) + 1

    print(f"{len(features)} routes: " + ", ".join(f"{v} {k}" for k, v in counts.items()))


if __name__ == "__main__":
    kinds = tuple(sys.argv[3].split(",")) if len(sys.argv) > 3 else MARITIME
    bounds = [ float(n) for n in sys.argv[4].split(",") ] if len(sys.argv) > 4 else None
    main(sys.argv[1], sys.argv[2], kinds, bounds)
