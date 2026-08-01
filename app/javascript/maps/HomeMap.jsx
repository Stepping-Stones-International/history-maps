import React, { useEffect, useRef } from "react"
import { Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl"

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
    { id: "background", type: "background", paint: { "background-color": "#0d1218" } },
    {
      id: "ocean",
      type: "raster",
      source: "ocean",
      // Esri's rasters are light; dim and desaturate them into the dark theme.
      paint: {
        "raster-opacity": 0.5,
        "raster-brightness-max": 0.22,
        "raster-saturation": 0.1,
        "raster-contrast": 0.15
      }
    },
    {
      id: "relief",
      type: "raster",
      source: "relief",
      paint: {
        "raster-opacity": 0.9,
        "raster-brightness-max": 0.34,
        "raster-saturation": -0.5,
        "raster-contrast": 0.3
      }
    }
  ]
}

export default function HomeMap({ nodes = [], placing = false, onMapClick }) {
  const container = useRef(null)
  const map = useRef(null)
  const markers = useRef(new Map())
  // Held in a ref so changing the handler does not re-bind the map listener.
  const clickHandler = useRef(onMapClick)
  clickHandler.current = onMapClick

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

    map.current.on("click", (event) => {
      clickHandler.current?.({ longitude: event.lngLat.lng, latitude: event.lngLat.lat })
    })

    return () => {
      markers.current.forEach((marker) => marker.remove())
      markers.current.clear()
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Crosshair while a node is waiting to be placed.
  useEffect(() => {
    const canvas = map.current?.getCanvas()
    if (canvas) canvas.style.cursor = placing ? "crosshair" : ""
  }, [placing])

  // Reconcile markers against the current nodes.
  useEffect(() => {
    if (!map.current) return

    const seen = new Set()

    nodes.forEach((node) => {
      seen.add(node.id)
      if (markers.current.has(node.id)) return

      // Built as DOM with textContent, never HTML: this is user input.
      const content = document.createElement("div")
      content.className = "node-popup"

      const title = document.createElement("p")
      title.className = "node-popup__title"
      title.textContent = node.title
      content.appendChild(title)

      if (node.description) {
        const description = document.createElement("p")
        description.className = "node-popup__description"
        description.textContent = node.description
        content.appendChild(description)
      }

      const marker = new Marker({ color: "#8fb8e8" })
        .setLngLat([node.longitude, node.latitude])
        .setPopup(new Popup({ offset: 18, closeButton: false }).setDOMContent(content))
        .addTo(map.current)

      markers.current.set(node.id, marker)
    })

    markers.current.forEach((marker, id) => {
      if (seen.has(id)) return
      marker.remove()
      markers.current.delete(id)
    })
  }, [nodes])

  return <div ref={container} className="home-map" />
}
