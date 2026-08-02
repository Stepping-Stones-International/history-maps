"""Pull the maritime routes out of ORBIS v2's route network.

ORBIS is Stanford's geospatial network model of the Roman world. Its published
route layer carries roads, river routes and sea routes together, told apart by
the `t` property; this keeps the three maritime kinds:

    coastal    hugging the shore, port to port
    overseas   open-water crossings
    ferry      short hops across a strait

Source (MIT licensed at the repository level):

    https://github.com/emeeks/orbis_v2   (base_routes.geojson)

Take that file and run:

    python3 script/extract_orbis_routes.py base_routes.geojson \\
      app/assets/data/orbis-sea-routes.geojson

Unlike the road packs this is not clipped: sea lanes are few and cheap, and
cutting them at the edge of the New Testament window would drop the western
Mediterranean, where Paul meant to sail to Spain. It is not simplified either
— a sea route is drawn as the crossing it is, mostly straight, so there is
nothing to thin. Coordinates are rounded to five decimals, about a metre.

Note that `o_mesh.sql` in the ORBIS repository is a different thing: the
directional routing mesh used to compute travel against wind and current. It
is the cost grid behind the model, not the route layer, so it is not used here.
"""

import json
import sys

MARITIME = ("coastal", "overseas", "ferry")


def rounded(points):
    return [ [ round(point[0], 5), round(point[1], 5) ] for point in points ]


def main(source, destination):
    collection = json.load(open(source))

    features = []
    for feature in collection["features"]:
        kind = feature["properties"].get("t")
        if kind not in MARITIME:
            continue

        geometry = feature["geometry"]
        if geometry["type"] == "LineString":
            shape = { "type": "LineString", "coordinates": rounded(geometry["coordinates"]) }
        elif geometry["type"] == "MultiLineString":
            shape = {
                "type": "MultiLineString",
                "coordinates": [ rounded(line) for line in geometry["coordinates"] ]
            }
        else:
            continue

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

    print(f"{len(features)} maritime routes: " + ", ".join(f"{v} {k}" for k, v in counts.items()))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
