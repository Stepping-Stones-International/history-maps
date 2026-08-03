"""Drop routes that another pack already draws.

ORBIS models the whole Roman network, so most of its land links in the Levant
run along roads Itiner-e already maps in far more detail. Drawing both leaves
two lines over one road and buries the part that is actually new. This keeps
only the routes that go where the other pack does not:

    python3 script/drop_covered_routes.py in.geojson out.geojson covered.geojson

A route is walked at 2 km intervals and each point measured against the
covering pack. A route more than half of whose length runs within 5 km of it
is dropped. Between those two the choice is not close: for ORBIS against
Itiner-e in Mesopotamia, fifteen links came out 83-100% covered and six came
out under 30%, with nothing in between.
"""

import json
import math
import sys

CELL = 0.05


def points_of(feature):
    geometry = feature["geometry"]
    return (
        [ geometry["coordinates"] ] if geometry["type"] == "LineString"
        else geometry["coordinates"]
    )


def index_of(features):
    """Every covering vertex, bucketed by a coarse grid so the search is local."""
    grid = {}
    for feature in features:
        for line in points_of(feature):
            for longitude, latitude in line:
                grid.setdefault((int(longitude / CELL), int(latitude / CELL)), []) \
                    .append((longitude, latitude))
    return grid


def distance_km(grid, longitude, latitude):
    closest = float("inf")
    x, y = int(longitude / CELL), int(latitude / CELL)

    for i in range(x - 2, x + 3):
        for j in range(y - 2, y + 3):
            for other_x, other_y in grid.get((i, j), ()):
                span = math.hypot(
                    (other_x - longitude) * math.cos(math.radians(latitude)),
                    other_y - latitude
                ) * 111.32
                closest = min(closest, span)

    return closest


def walked(line, step_km=2.0):
    """The line as points every step_km, so long links are judged over their length."""
    out = []
    for (x0, y0), (x1, y1) in zip(line, line[1:]):
        span = math.hypot((x1 - x0) * math.cos(math.radians(y0)), y1 - y0) * 111.32
        steps = max(1, int(span / step_km))
        out += [ (x0 + (x1 - x0) * k / steps, y0 + (y1 - y0) * k / steps) for k in range(steps) ]

    out.append(tuple(line[-1]))
    return out


def main(source, destination, covering, near_km=5.0, share=0.5):
    routes = json.load(open(source))
    grid = index_of(json.load(open(covering))["features"])

    kept = []
    for feature in routes["features"]:
        walk = [ point for line in points_of(feature) for point in walked(line) ]
        covered = sum(1 for x, y in walk if distance_km(grid, x, y) <= near_km) / len(walk)
        if covered < share:
            kept.append(feature)

    routes["features"] = kept
    with open(destination, "w") as out:
        json.dump(routes, out, separators=(",", ":"))

    print(f"kept {len(kept)} routes, dropped {len(json.load(open(source))['features']) - len(kept)}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
