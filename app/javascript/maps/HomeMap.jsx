import React, { useEffect, useRef } from "react"
import { Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl"

// Built as DOM with textContent, never HTML: this is user input.
function nodeLabel(node) {
  const label = document.createElement("div")

  const title = document.createElement("span")
  title.className = "node-label__title"
  title.textContent = node.title
  label.appendChild(title)

  if (node.date_display) {
    const date = document.createElement("span")
    date.className = "node-label__date"
    date.textContent = node.date_display
    label.appendChild(date)
  }

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

const SVG_NS = "http://www.w3.org/2000/svg"

const MARKER_COLOR = "#8fb8e8"
const MARKER_ACTIVE_COLOR = "#f2b640"
const MARKER_SIZE = { width: 20, height: 18 }
const MARKER_ACTIVE_SIZE = { width: 30, height: 27 }

// A triangle pointing down at its coordinate, drawn ourselves so colour and
// size are plain CSS rather than surgery on MapLibre's pin.
function markerElement() {
  const element = document.createElement("div")
  element.className = "node-marker"

  const svg = document.createElementNS(SVG_NS, "svg")
  svg.setAttribute("viewBox", "0 0 20 18")

  const triangle = document.createElementNS(SVG_NS, "polygon")
  triangle.setAttribute("points", "0,0 20,0 10,18")

  svg.appendChild(triangle)
  element.appendChild(svg)
  paintMarker(element, false)
  return element
}

// Size and colour are set as attributes rather than left to CSS, so the
// triangle cannot be left at its base size by a stylesheet ordering surprise.
function paintMarker(element, active) {
  const { width, height } = active ? MARKER_ACTIVE_SIZE : MARKER_SIZE
  const svg = element.querySelector("svg")

  svg.setAttribute("width", width)
  svg.setAttribute("height", height)
  svg.querySelector("polygon").setAttribute("fill", active ? MARKER_ACTIVE_COLOR : MARKER_COLOR)
}

export default function HomeMap({
  nodes = [], placing = false, highlightedId = null, defaultView = null,
  viewReader = null, onMapClick, onNodeSelect
}) {
  const container = useRef(null)
  const map = useRef(null)
  const markers = useRef(new Map())
  const labels = useRef(new Map())
  const highlightedRef = useRef(highlightedId)
  highlightedRef.current = highlightedId
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

    // A saved view wins; otherwise open on the region this was built around.
    const opening = defaultView
      ? { center: [ defaultView.longitude, defaultView.latitude ], zoom: defaultView.zoom }
      : { bounds: REGION_BOUNDS, fitBoundsOptions: { padding: 20 } }

    map.current = new MapLibreMap({
      container: container.current,
      style: TOPO_STYLE,
      minZoom: 3,
      maxZoom: 12,
      attributionControl: { compact: true },
      ...opening
    })

    // Lets the page read the current view when asked to remember it.
    if (viewReader) {
      viewReader.current = () => {
        const center = map.current.getCenter()
        return {
          latitude: Number(center.lat.toFixed(6)),
          longitude: Number(center.lng.toFixed(6)),
          zoom: Number(map.current.getZoom().toFixed(2))
        }
      }
    }

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

  // Reconcile markers against the current nodes. Layers have no coordinates,
  // so nothing is drawn for them.
  useEffect(() => {
    if (!map.current) return

    const seen = new Set()

    nodes.filter((node) => node.latitude != null && node.longitude != null).forEach((node) => {
      seen.add(node.id)

      const existing = markers.current.get(node.id)
      if (existing) {
        // Keep a moved or renamed node in step without rebuilding the marker.
        existing.setLngLat([node.longitude, node.latitude])
        existing.getElement().setAttribute("aria-label", node.title)
        labels.current.get(node.id)
          ?.setLngLat([node.longitude, node.latitude])
          ?.setDOMContent(nodeLabel(node))
        return
      }

      // Label shown on hover. Positioned itself rather than via setPopup, so
      // MapLibre's own click-to-toggle never competes with selecting.
      const popup = new Popup({
        offset: 30,
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        maxWidth: "260px",
        className: "node-label"
      })
        .setLngLat([node.longitude, node.latitude])
        .setDOMContent(nodeLabel(node))

      const marker = new Marker({ element: markerElement(), anchor: "bottom" })
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
      // A highlighted node keeps its label up after the cursor leaves.
      const hideLabel = () => { if (highlightedRef.current !== node.id) popup.remove() }

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

  // Highlighted node: bigger, recoloured, with its label showing.
  useEffect(() => {
    if (!map.current) return

    markers.current.forEach((marker, id) => {
      const active = id === highlightedId
      const element = marker.getElement()
      element.classList.toggle("node-marker--active", active)
      paintMarker(element, active)

      const popup = labels.current.get(id)
      if (!popup) return
      if (active && !popup.isOpen()) popup.addTo(map.current)
      if (!active && popup.isOpen()) popup.remove()
    })
  }, [highlightedId, nodes])

  return <div ref={container} className="home-map" />
}
