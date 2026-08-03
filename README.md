# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Map data

Every overlay is an extract of a published dataset, and **the credit travels
with the data**: each file under `app/assets/data` carries a `source` block
naming its citation, URL, licence, and exactly what the extract script did to
it. Anyone downloading a file gets its provenance in the same breath.

| Pack | Source | Licence |
|---|---|---|
| Roman roads | [Itiner-e](https://doi.org/10.5281/zenodo.17122148) — Brughmans, Pažout, de Soto & Bjerregaard Vahlstrup | CC BY 4.0 |
| Roman roads, named viae | [AWMC geodata](https://github.com/AWMC/geodata), after the Barrington Atlas | ODbL 1.0 |
| Sea routes | [ORBIS](https://github.com/emeeks/orbis_v2) — Scheidel & Meeks, Stanford | MIT |
| Navigable rivers | ORBIS, as above | MIT |
| Roads of northern Mesopotamia | ORBIS, as above | MIT |

Packs carry lines and shapes only. Places are nodes, which already hold a
title, a date and a description, so a pack of points would draw them twice.

Imported nodes carry their provenance too, in each node's own description:
cities of the Roman world from [Hanson's Cities Database](https://doi.org/10.5287/bodleian:eqapevAn8)
(with its Barrington rank and per-city bibliography), cities of Mesopotamia
from [Pleiades](https://pleiades.stoa.org) (CC BY) with founding years from
Wikidata (CC0), and the stations of
[Isidore of Charax](https://github.com/AWMC/isidore) as mapped by AWMC — each
naming the record it came from.

The scripts that produced every extract are in `script/`, one per source, with
the exact command in each file's header — so any extract can be reproduced,
re-cut to a different region, or re-run against a newer release of its source.

Packs are declared in `Topic::MAP_PACKS`, which names the file each one draws
from; the layout turns that into a meta tag per pack so the browser fetches a
pack's data only once a topic switches it on. Credits are also shown on the map
itself, through MapLibre's attribution control.
