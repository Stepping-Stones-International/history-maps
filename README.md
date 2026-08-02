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

`app/assets/data/roman-roads.geojson` is the checked-in extract; see
`script/extract_roads.py` for how it was clipped and thinned from the source
GeoPackage, and re-run it to change the region or the level of detail. The
credit is shown on the map itself, through MapLibre's attribution control.
