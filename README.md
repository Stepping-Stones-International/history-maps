# Stepping Stones International

## History Maps

This project helps Stepping Stones International build map-based teaching
materials for studying Christian history, biblical history, sources, places,
political boundaries, and historical change over time. The current
collaborative build is `0.1.0-dev`.

## Welcome

Use these links to find the right starting point:

- [What the project is](#history-maps)
- [Set up a development copy](#setup)
- [Run and use the application](#use-the-application)
- [Contribute with a normal Git workflow](docs/CONTRIBUTING.md)
- [Contribute with an LLM](docs/LLM_CONTRIBUTING.md)
- [Map data, sources, and attribution](#map-data)
- [GitHub Actions](#continuous-integration)

## Setup

The application is a Rails project with a JavaScript map interface. Install
Ruby and Node.js, then run:

    make setup

This installs Ruby and JavaScript dependencies and prepares the development
database. If you prefer to run the steps separately:

    bundle install
    yarn install
    bin/rails db:prepare

## Use the application

Start the local application with:

    make dev

Then open `http://localhost:3000`. Create or open a topic to work with nodes,
layers, dates, descriptions, source notes, and map geometries. Use `make
server` when you only need the Rails server, without the JavaScript watcher.

Useful commands:

| Command | Purpose |
|---|---|
| `make dev` | Start the Rails server and JavaScript watcher |
| `make server` | Start only the Rails server |
| `make build` | Build the JavaScript assets once |
| `make test` | Run the test suite |
| `make coverage` | Run tests and open the HTML coverage report |
| `make lint` | Run RuboCop |

## Contributing

All contributions enter the protected `main` branch through pull requests.
Start with the [contribution guide](docs/CONTRIBUTING.md). If an LLM will help
you work, read the [LLM contribution guide](docs/LLM_CONTRIBUTING.md) before
giving it repository access or asking it to edit files.

## Continuous integration

GitHub Actions runs the build and test jobs for pushes and pull requests. The
test suite enforces a minimum of 90% line coverage. See
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

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
