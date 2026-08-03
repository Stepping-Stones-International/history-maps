// The reference overlays a topic can draw beneath its own nodes.
//
// Each one's data is a fingerprinted asset named in the layout, fetched only
// once its pack is switched on: together they are several megabytes, and most
// sessions ask for none of them.
const packUrl = (key) => document.querySelector(`meta[name="map-pack-${key}"]`)?.content

// How a road is drawn, whichever pack it came from: solid, and heavier for a
// main road than a secondary one.
const MAIN_ROAD = { opacity: 0.9, widths: [ 4, 1.4, 9, 2.6, 12, 4 ] }
const SECONDARY_ROAD = { opacity: 0.55, widths: [ 4, 0.8, 9, 1.6, 12, 2.6 ] }

// Two reconstructions of the same network, so they are told apart by colour
// rather than by which is on top: Itiner-e in ochre, the Barrington in sage.
const roadLayers = (main, secondary) => [
  {
    suffix: "secondary",
    filter: [ "!=", [ "get", "kind" ], "Main Road" ],
    color: secondary,
    ...SECONDARY_ROAD
  },
  {
    suffix: "main",
    filter: [ "==", [ "get", "kind" ], "Main Road" ],
    color: main,
    ...MAIN_ROAD
  }
]

// Sea routes are dashed: they are sailed, not built, and the dashes also say
// plainly that this is a modelled network rather than surveyed ground.
const seaLayers = () => [
  {
    suffix: "coastal",
    filter: [ "!=", [ "get", "kind" ], "overseas" ],
    color: "#5f9ea8",
    opacity: 0.6,
    widths: [ 4, 0.7, 9, 1.4, 12, 2.2 ],
    dashes: [ 2, 1.6 ]
  },
  {
    suffix: "overseas",
    filter: [ "==", [ "get", "kind" ], "overseas" ],
    color: "#7ec8d6",
    opacity: 0.85,
    widths: [ 4, 1.2, 9, 2.2, 12, 3.4 ],
    dashes: [ 3, 1.8 ]
  }
]

export const MAP_PACKS = {
  roman_roads: {
    url: () => packUrl("roman_roads"),
    credit: '<a href="https://itiner-e.org" target="_blank" rel="noopener">Itiner-e</a> ' +
            "roads (CC BY 4.0)",
    layers: roadLayers("#e0a568", "#c98f5a")
  },
  sea_routes: {
    url: () => packUrl("sea_routes"),
    credit: '<a href="https://orbis.stanford.edu" target="_blank" rel="noopener">ORBIS</a> ' +
            "sea routes (MIT)",
    layers: seaLayers()
  },
  mesopotamia_roads: {
    url: () => packUrl("mesopotamia_roads"),
    credit: '<a href="https://orbis.stanford.edu" target="_blank" rel="noopener">ORBIS</a> ' +
            "roads (MIT)",
    // Drawn as Itiner-e draws a main road, since it is carrying on from where
    // Itiner-e stops: ORBIS marks no main or secondary here, so all of it is
    // the heavier line.
    layers: [
      {
        suffix: "road",
        filter: [ "==", [ "get", "kind" ], "road" ],
        color: "#e0a568",
        ...MAIN_ROAD
      }
    ]
  },
  awmc_roads: {
    url: () => packUrl("awmc_roads"),
    credit: '<a href="https://awmc.unc.edu" target="_blank" rel="noopener">AWMC</a> ' +
            "roads (ODbL)",
    layers: roadLayers("#a8bf7a", "#8a9d63")
  }
}

export const packLayerId = (key, suffix) => `map-pack-${key}-${suffix}`
export const packSourceId = (key) => `map-pack-${key}`
