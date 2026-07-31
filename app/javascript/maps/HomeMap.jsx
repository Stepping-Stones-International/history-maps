import React, { useEffect, useRef } from "react"
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from "maplibre-gl"

const workerUrl = document.querySelector('meta[name="maplibre-worker-url"]')?.content
if (workerUrl) setWorkerUrl(workerUrl)

// Egypt (south/west) through Turkey (north), with Israel and Lebanon in the middle.
const REGION_BOUNDS = [
  [23.5, 21.0], // south-west
  [46.5, 42.8]  // north-east
]

// Label-free terrain: shaded relief with no place names, roads or borders.
const TOPO_STYLE = {
  version: 8,
  sources: {
    relief: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 13,
      attribution: "Esri, USGS, NOAA"
    },
    ocean: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 13,
      attribution: "Esri, GEBCO, NOAA"
    }
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#b3cede" } },
    { id: "ocean", type: "raster", source: "ocean", paint: { "raster-opacity": 1 } },
    { id: "relief", type: "raster", source: "relief", paint: { "raster-opacity": 0.9 } }
  ]
}

export default function HomeMap() {
  const container = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    map.current = new MapLibreMap({
      container: container.current,
      style: TOPO_STYLE,
      bounds: REGION_BOUNDS,
      fitBoundsOptions: { padding: 20 },
      minZoom: 3,
      maxZoom: 12,
      attributionControl: { compact: true }
    })

    map.current.addControl(new NavigationControl({ showCompass: false }), "top-right")

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  return <div ref={container} className="home-map" />
}
