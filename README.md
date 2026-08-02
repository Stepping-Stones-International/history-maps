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

The Roman road overlay is an extract of **Itiner-e**, the road network as it
stood around AD 150, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/):

> Brughmans, Pažout, de Soto and Bjerregaard Vahlstrup, *Itiner-e: the digital
> atlas of ancient roads*. https://doi.org/10.5281/zenodo.17122148

A second reconstruction of the same network comes from the **Ancient World
Mapping Centre**, drawn from the Barrington Atlas and licensed
[ODbL](https://opendatacommons.org/licenses/odbl/1-0/):

> Ancient World Mapping Centre, *Cultural Data: roads*.
> https://github.com/AWMC/geodata

Both extracts are checked in under `app/assets/data`, with the script that
produced each beside it in `script/` — re-run either to change the region or
the level of detail. Being ODbL, the AWMC extract is itself offered under
ODbL. Credits are shown on the map through MapLibre's attribution control.

Packs are declared in `Topic::MAP_PACKS`, which names the file each one draws
from; the layout turns that into a meta tag per pack so the browser fetches a
pack's data only once a topic switches it on.
