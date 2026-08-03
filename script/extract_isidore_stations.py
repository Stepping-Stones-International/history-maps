"""The stations of Isidore of Charax's Parthian Stations, as mapped by AWMC.

Isidore's itinerary walks the Parthian road from Antioch and Zeugma, down the
Euphrates past Dura and Seleucia, over the Zagros by Behistun, and on through
Parthia to Alexandria in Arachosia — modern Kandahar. It is the only route
east of the Euphrates in any of this map's sources, and it is a first-century
description rather than a modelled network.

    https://github.com/AWMC/isidore   (points.geojson)

The repository is GPL-3.0, unlike AWMC's ODbL geodata, so the extract carries
that licence with it.

    python3 script/extract_isidore_stations.py points.geojson \\
      app/assets/data/isidore-stations.geojson [pleiades-places.csv]

Given the Pleiades dump as well, each station is checked against the place its
own PleiadesID points to. Two thirds land within a few kilometres; the rest do
not, and one Alexandreia is identified with a city on the Indus a thousand
kilometres away. Those get an `id_disagrees_km` property so the error travels
with the data instead of being quietly passed on as fact.
"""

import csv
import json
import math
import sys

FAR_KM = 100

SOURCE = {
    "name": "Isidore of Charax, Parthian Stations, as mapped by AWMC",
    "citation": "Ancient World Mapping Centre, Isidore's Parthian Stations; "
                "after Isidore of Charax, Mansiones Parthicae (first century AD)",
    "url": "https://github.com/AWMC/isidore",
    "licence": "GPL-3.0",
    "licence_url": "https://www.gnu.org/licenses/gpl-3.0.html"
}


def pleiades_points(path):
    if not path:
        return {}

    places = {}
    for row in csv.DictReader(open(path, encoding="utf-8", errors="replace")):
        if row["reprLat"].strip() and row["reprLong"].strip():
            places[row["id"]] = (float(row["reprLong"]), float(row["reprLat"]))

    return places


def apart_km(a, b):
    return math.hypot(
        (a[0] - b[0]) * math.cos(math.radians(a[1])),
        a[1] - b[1]
    ) * 111.32


def main(source, destination, pleiades_path=None):
    places = pleiades_points(pleiades_path)
    stations = json.load(open(source))

    features = []
    flagged = 0

    for feature in stations["features"]:
        geometry = feature.get("geometry")
        given = feature.get("properties") or {}
        title = (given.get("Title") or "").strip()

        # A few records are entirely empty, and a station with no title or no
        # position is nothing to draw.
        if not geometry or geometry.get("type") != "Point" or not title:
            continue

        properties = { "title": title }

        pleiades_id = given.get("PleiadesID")
        if pleiades_id:
            properties["pleiades_id"] = pleiades_id
            properties["link"] = given.get("Link") or \
                f"https://pleiades.stoa.org/places/{pleiades_id}"

            known = places.get(str(pleiades_id))
            if known:
                apart = apart_km(geometry["coordinates"], known)
                if apart > FAR_KM:
                    properties["id_disagrees_km"] = round(apart)
                    flagged += 1

        features.append({
            "type": "Feature",
            "properties": properties,
            "geometry": {
                "type": "Point",
                "coordinates": [ round(c, 5) for c in geometry["coordinates"] ]
            }
        })

    with open(destination, "w") as out:
        json.dump({
            "type": "FeatureCollection",
            "source": {
                **SOURCE,
                "processing": "Empty and untitled records dropped; stations whose cited "
                              f"Pleiades place lies over {FAR_KM}km away carry "
                              "id_disagrees_km, by script/extract_isidore_stations.py"
            },
            "features": features
        }, out, separators=(",", ":"))

    named = sum(1 for f in features if f["properties"].get("pleiades_id"))
    print(f"{len(features)} stations, {named} identified with a Pleiades place, "
          f"{flagged} of those disagreeing by more than {FAR_KM}km")


if __name__ == "__main__":
    main(*sys.argv[1:4])
