# Map data and sources

[← Setup and installation](SETUP_AND_INSTALLATION.md) · [User guide](USER_GUIDE.md)

Every overlay is an extract of a published dataset, and **the credit travels
with the data**. Each file under `app/assets/data` carries a `source` block
naming its citation, URL, license, and exactly what the extract script did to
it.

| Pack | Source | License |
|---|---|---|
| Roman roads | [Itiner-e](https://doi.org/10.5281/zenodo.17122148) — Brughmans, Pažout, de Soto & Bjerregaard Vahlstrup | CC BY 4.0 |
| Roman roads, named viae | [AWMC geodata](https://github.com/AWMC/geodata), after the Barrington Atlas | ODbL 1.0 |
| Sea routes | [ORBIS](https://github.com/emeeks/orbis_v2) — Scheidel & Meeks, Stanford | MIT |
| Navigable rivers | ORBIS, as above | MIT |
| Roads of northern Mesopotamia | ORBIS, as above | MIT |

Packs carry lines and shapes only. Places are nodes, which already hold a
title, date, and description, so a pack of points would draw them twice.

Imported nodes carry their provenance in their descriptions: cities of the
Roman world from [Hanson's Cities Database](https://doi.org/10.5287/bodleian:eqapevAn8),
cities of Mesopotamia from [Pleiades](https://pleiades.stoa.org) with founding
years from Wikidata, and the stations of
[Isidore of Charax](https://github.com/AWMC/isidore) as mapped by AWMC.

The scripts that produced each extract are in `script/`, with the exact
command in each file's header. Extracts can therefore be reproduced, re-cut
to a different region, or re-run against a newer source release.

Packs are declared in `Topic::MAP_PACKS`. Credits are also shown on the map
through MapLibre's attribution control.
