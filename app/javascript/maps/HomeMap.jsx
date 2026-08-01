import React, { useEffect, useRef } from "react"
import { Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl"

function nodeLabel(title) {
  const label = document.createElement("span")
  label.className = "node-label__title"
  label.textContent = title
  return label
}

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

export default function HomeMap({ nodes = [], placing = false, onMapClick, onNodeSelect }) {
  const container = useRef(null)
  const map = useRef(null)
  const markers = useRef(new Map())
  const labels = useRef(new Map())
  // Held in refs so changing these does not re-bind the map and marker
  // listeners, which are attached once when each is created.
  const clickHandler = useRef(onMapClick)
  clickHandler.current = onMapClick
  const selectHandler = useRef(onNodeSelect)
  selectHandler.current = onNodeSelect
  const placingRef = useRef(placing)
  placingRef.current = placing

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
      labels.current.forEach((label) => label.remove())
      labels.current.clear()
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

      const existing = markers.current.get(node.id)
      if (existing) {
        // Keep a moved or renamed node in step without rebuilding the marker.
        existing.setLngLat([node.longitude, node.latitude])
        existing.getElement().setAttribute("aria-label", node.title)
        labels.current.get(node.id)
          ?.setLngLat([node.longitude, node.latitude])
          ?.setDOMContent(nodeLabel(node.title))
        return
      }

      // Label shown on hover. Positioned itself rather than via setPopup, so
      // MapLibre's own click-to-toggle never competes with selecting.
      const popup = new Popup({
        offset: 30,
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        className: "node-label"
      })
        .setLngLat([node.longitude, node.latitude])
        .setDOMContent(nodeLabel(node.title))

      const marker = new Marker({ color: "#8fb8e8" })
        .setLngLat([node.longitude, node.latitude])
        .addTo(map.current)

      const select = (event) => {
        event.stopPropagation()
        // While placing, the next click belongs to the map.
        if (placingRef.current) return
        selectHandler.current?.(node.id)
      }

      const element = marker.getElement()
      element.style.cursor = "pointer"
      element.setAttribute("role", "button")
      element.setAttribute("aria-label", node.title)
      element.addEventListener("click", select)

      const showLabel = () => { if (!popup.isOpen()) popup.addTo(map.current) }
      const hideLabel = () => popup.remove()

      element.addEventListener("mouseenter", showLabel)
      element.addEventListener("mouseleave", hideLabel)

      // The label is part of the same target: it selects, and hovering it
      // keeps the label up rather than flickering it away.
      popup.on("open", () => {
        const content = popup.getElement()
        content.style.cursor = "pointer"
        content.addEventListener("click", select)
        content.addEventListener("mouseenter", showLabel)
        content.addEventListener("mouseleave", hideLabel)
      })

      markers.current.set(node.id, marker)
      labels.current.set(node.id, popup)
    })

    markers.current.forEach((marker, id) => {
      if (seen.has(id)) return
      marker.remove()
      markers.current.delete(id)
      labels.current.get(id)?.remove()
      labels.current.delete(id)
    })
  }, [nodes])

  return <div ref={container} className="home-map" />
}
