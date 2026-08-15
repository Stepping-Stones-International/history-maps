import React, { useEffect, useRef } from "react"
import { Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl"
import areaCentroid from "./areaCentroid"
import { MAP_PACKS, packLayerId, packSourceId } from "./mapPacks"

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

const AREA_SOURCE = "node-areas"

// A ring of [longitude, latitude] pairs becomes a closed polygon. GeoJSON wants
// the first point repeated at the end, which the stored ring does not carry.
function areaFeatures(nodes) {
  return nodes
    .filter((node) => Array.isArray(node.area) && node.area.length >= 3)
    .map((node) => {
      const ring = [ ...node.area ]
      const [ first ] = ring
      const last = ring[ring.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first)

      return {
        type: "Feature",
        properties: { id: node.id, title: node.title, color: node.polygon_color || "#8fb8e8" },
        geometry: { type: "Polygon", coordinates: [ ring ] }
      }
    })
}

const MARKER_ACTIVE_COLOR = "#f2b640"
const MARKER_COLOR = "#8fb8e8"
const DEFAULT_MARKER = "waypoint"
// A triangle points at its coordinate from above, so it hangs by its tip; a
// circle sits on the spot.
const MARKER_SHAPES = {
  triangle: { box: "0 0 20 18", ratio: 18 / 20, anchor: "bottom" },
  circle: { box: "0 0 20 20", ratio: 1, anchor: "center" }
}
const MARKER_WIDTH = 20
const MARKER_ACTIVE_WIDTH = 30

const markerShape = (marker) => MARKER_SHAPES[marker?.shape] || MARKER_SHAPES.triangle

// Drawn ourselves rather than by surgery on MapLibre's pin, so the shape and
// colour are whatever the node was given.
function markerElement(marker) {
  const element = document.createElement("div")
  element.className = "node-marker"

  const shape = markerShape(marker)
  const svg = document.createElementNS(SVG_NS, "svg")
  svg.setAttribute("viewBox", shape.box)

  if (marker?.shape === "circle") {
    const circle = document.createElementNS(SVG_NS, "circle")
    circle.setAttribute("cx", 10)
    circle.setAttribute("cy", 10)
    circle.setAttribute("r", 8)
    svg.appendChild(circle)
  } else {
    const triangle = document.createElementNS(SVG_NS, "polygon")
    triangle.setAttribute("points", "0,0 20,0 10,18")
    svg.appendChild(triangle)
  }

  element.appendChild(svg)
  paintMarker(element, false, marker)
  return element
}

// Size and colour are set as attributes rather than left to CSS, so a marker
// cannot be left at its base size by a stylesheet ordering surprise. Being
// picked out overrides the node's own colour, whatever shape it is.
function paintMarker(element, active, marker) {
  const shape = markerShape(marker)
  const width = active ? MARKER_ACTIVE_WIDTH : MARKER_WIDTH
  const svg = element.querySelector("svg")

  svg.setAttribute("width", width)
  svg.setAttribute("height", Math.round(width * shape.ratio))
  svg.firstChild.setAttribute("fill", active ? MARKER_ACTIVE_COLOR : (marker?.color || MARKER_COLOR))
}

export default function HomeMap({
  nodes = [], placing = false, highlightedId = null, defaultView = null,
  viewReader = null, packs = [], markers: markerKinds = [], onMapClick, onNodeSelect
}) {
  const container = useRef(null)
  const map = useRef(null)
  const markers = useRef(new Map())
  const labels = useRef(new Map())
  const areaLabels = useRef(new Map())
  const styleReady = useRef(false)
  // Kept once fetched, so switching a pack off and on again is free.
  const packData = useRef(new Map())
  // What icon each drawn marker was built with, so a node that changes icon is
  // rebuilt rather than repainted into the wrong shape.
  const nodeMarkers = useRef(new Map())
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
  // Read by the load handler, which may fire after the first render.
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  // Sent by the server, so the form's picker and the map cannot disagree.
  const markersById = Object.fromEntries(markerKinds.map((kind) => [ kind.value, kind ]))
  const iconFor = (node) => markersById[node?.marker] || markersById[DEFAULT_MARKER]

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

    // Areas are map layers, so they always sit beneath the waypoints, which are
    // DOM elements above the canvas.
    //
    // Returns true once the layers are in place. Adding a source throws while
    // the style is still loading, and that throw is the signal to wait — the
    // same reason the roads below do not ask isStyleLoaded either.
    const addAreaLayers = () => {
      if (!map.current) return false

      try {
        return buildAreaLayers()
      } catch {
        return false
      }
    }

    const buildAreaLayers = () => {
      // Keyed off the last piece to go in, so a part-built style is finished
      // rather than mistaken for a finished one.
      if (map.current.getLayer(`${AREA_SOURCE}-line`)) return true

      if (!map.current.getSource(AREA_SOURCE)) {
        map.current.addSource(AREA_SOURCE, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        })
      }

      if (!map.current.getLayer(`${AREA_SOURCE}-fill`)) {
        map.current.addLayer({
          id: `${AREA_SOURCE}-fill`,
          type: "fill",
          source: AREA_SOURCE,
          paint: { "fill-color": [ "get", "color" ], "fill-opacity": 0.18 }
        })
      }

      map.current.addLayer({
        id: `${AREA_SOURCE}-line`,
        type: "line",
        source: AREA_SOURCE,
        paint: { "line-color": [ "get", "color" ], "line-width": 1.5, "line-opacity": 0.8 }
      })

      const showAreaLabel = (event) => {
        const id = event.features?.[0]?.properties?.id
        const popup = id && areaLabels.current.get(id)
        map.current.getCanvas().style.cursor = placingRef.current ? "crosshair" : "pointer"
        if (popup && !popup.isOpen()) popup.addTo(map.current)
      }

      const hideAreaLabels = () => {
        map.current.getCanvas().style.cursor = placingRef.current ? "crosshair" : ""
        areaLabels.current.forEach((popup, id) => {
          if (id !== highlightedRef.current) popup.remove()
        })
      }

      map.current.on("mousemove", `${AREA_SOURCE}-fill`, showAreaLabel)
      map.current.on("mouseleave", `${AREA_SOURCE}-fill`, hideAreaLabels)

      styleReady.current = true
      map.current.getSource(AREA_SOURCE)?.setData({
        type: "FeatureCollection",
        features: areaFeatures(nodesRef.current)
      })

      return true
    }

    // styledata fires as the style settles and idle every time the map comes
    // to rest, so between them the layers land however slowly the style
    // arrives. Both are dropped once they are in.
    if (!addAreaLayers()) {
      const wake = [ "styledata", "idle" ]
      const retry = () => {
        if (addAreaLayers()) wake.forEach((event) => map.current?.off(event, retry))
      }
      wake.forEach((event) => map.current.on(event, retry))
    }

    map.current.on("click", (event) => {
      clickHandler.current?.({ longitude: event.lngLat.lng, latitude: event.lngLat.lat })
    })

    return () => {
      labels.current.forEach((label) => label.remove())
      labels.current.clear()
      areaLabels.current.forEach((label) => label.remove())
      areaLabels.current.clear()
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

  // The reference overlays. Each pack's data is fetched the first time it is
  // asked for and kept after that; switching one off hides its layers rather
  // than tearing them down, so coming back is instant.
  useEffect(() => {
    // A topic may still name a pack this build no longer ships; drawing waits
    // on the packs it knows and ignores the rest.
    const wanted = new Set(packs.filter((key) => MAP_PACKS[key]))

    const show = (key, visibility) => MAP_PACKS[key].layers.forEach(({ suffix }) => {
      const id = packLayerId(key, suffix)
      if (map.current?.getLayer(id)) map.current.setLayoutProperty(id, "visibility", visibility)
    })

    Object.keys(MAP_PACKS).filter((key) => !wanted.has(key)).forEach((key) => show(key, "none"))

    let dropped = false

    const build = (key) => {
      const pack = MAP_PACKS[key]
      const data = packData.current.get(key)
      if (!map.current.getSource(packSourceId(key))) {
        map.current.addSource(packSourceId(key), {
          type: "geojson",
          data,
          attribution: pack.credit
        })
      }

      // Under the node areas, so a topic's own shapes stay on top.
      const beneath = map.current.getLayer(`${AREA_SOURCE}-fill`)
        ? `${AREA_SOURCE}-fill`
        : undefined

      // Packs are routes and shapes only. Places belong to nodes, which carry a
      // date and a description and can be stepped through, so a pack of points
      // would draw the same things again in a second language.
      pack.layers.forEach(({ suffix, filter, color, opacity, widths, dashes }) => {
        const id = packLayerId(key, suffix)
        if (map.current.getLayer(id)) return

        map.current.addLayer({
          id,
          type: "line",
          source: packSourceId(key),
          filter,
          // A dashed line cannot be round-capped without the dashes closing up.
          layout: { "line-cap": dashes ? "butt" : "round", "line-join": "round" },
          paint: {
            "line-color": color,
            "line-opacity": opacity,
            "line-width": [ "interpolate", [ "linear" ], [ "zoom" ], ...widths ],
            ...(dashes ? { "line-dasharray": dashes } : {})
          }
        }, beneath)
      })

      show(key, "visible")
      return true
    }

    // Tries to draw everything asked for, and says whether it managed it all.
    // Adding a source throws while the style is still loading, which is the
    // signal to try again — isStyleLoaded is no use here, since it also waits
    // on every tile and so reads false whenever the map is fetching one.
    const draw = () => {
      if (dropped || !map.current) return false

      return [ ...wanted ].every((key) => {
        if (!packData.current.has(key)) return false

        try {
          return build(key)
        } catch {
          return false
        }
      })
    }

    // The data can arrive at any point in the map's life, so the retry has to
    // be one that keeps coming: idle fires every time the map settles, where
    // load fires once and would already be spent by the time a download of
    // this size finishes.
    const WAKE = [ "styledata", "idle" ]
    let retry = null

    const stopWaiting = () => {
      if (!retry) return
      WAKE.forEach((event) => map.current?.off(event, retry))
      retry = null
    }

    const drawWhenReady = () => {
      if (draw()) return

      if (retry) return
      retry = () => { if (draw()) stopWaiting() }
      WAKE.forEach((event) => map.current?.on(event, retry))
    }

    wanted.forEach((key) => {
      const url = MAP_PACKS[key]?.url()
      if (!url || packData.current.has(key)) return drawWhenReady()

      fetch(url)
        .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
        .then((collection) => {
          if (dropped) return
          packData.current.set(key, collection)
          drawWhenReady()
        })
        .catch(() => {})
    })

    drawWhenReady()

    return () => {
      dropped = true
      stopWaiting()
    }
  }, [packs])

  // Reconcile markers against the current nodes. Layers have no coordinates,
  // so nothing is drawn for them.
  useEffect(() => {
    if (!map.current) return

    const seen = new Set()

    nodes.filter((node) => node.latitude != null && node.longitude != null).forEach((node) => {
      seen.add(node.id)

      const existing = markers.current.get(node.id)
      // A changed icon means a different shape and anchor, so that marker is
      // torn down and built again rather than repainted.
      const restyled = existing && nodeMarkers.current.get(node.id) !== node.marker

      if (existing && !restyled) {
        // Keep a moved or renamed node in step without rebuilding the marker.
        existing.setLngLat([node.longitude, node.latitude])
        existing.getElement().setAttribute("aria-label", node.title)
        labels.current.get(node.id)
          ?.setLngLat([node.longitude, node.latitude])
          ?.setDOMContent(nodeLabel(node))
        return
      }

      if (restyled) {
        existing.remove()
        markers.current.delete(node.id)
        labels.current.get(node.id)?.remove()
        labels.current.delete(node.id)
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

      const icon = iconFor(node)
      nodeMarkers.current.set(node.id, node.marker)
      const marker = new Marker({
        element: markerElement(icon),
        anchor: markerShape(icon).anchor
      })
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
      nodeMarkers.current.delete(id)
    })
  }, [nodes])

  // Keep the drawn areas, and the labels anchored in the middle of them, in
  // step with the nodes.
  useEffect(() => {
    if (!map.current || !styleReady.current) return

    map.current.getSource(AREA_SOURCE)?.setData({
      type: "FeatureCollection",
      features: areaFeatures(nodes)
    })

    const seen = new Set()

    nodes.forEach((node) => {
      if (!Array.isArray(node.area) || node.area.length < 3) return

      const centre = areaCentroid(node.area)
      if (!centre) return

      seen.add(node.id)
      const existing = areaLabels.current.get(node.id)

      if (existing) {
        existing.setLngLat(centre).setDOMContent(nodeLabel(node))
        return
      }

      areaLabels.current.set(node.id, new Popup({
        offset: 0,
        closeButton: false,
        closeOnClick: false,
        focusAfterOpen: false,
        maxWidth: "260px",
        className: "node-label"
      }).setLngLat(centre).setDOMContent(nodeLabel(node)))
    })

    areaLabels.current.forEach((popup, id) => {
      if (seen.has(id)) return
      popup.remove()
      areaLabels.current.delete(id)
    })
  }, [nodes])

  // Highlighted node: bigger, recoloured, with its label showing.
  useEffect(() => {
    if (!map.current) return

    markers.current.forEach((marker, id) => {
      const active = id === highlightedId
      const element = marker.getElement()
      element.classList.toggle("node-marker--active", active)
      paintMarker(element, active, markersById[nodeMarkers.current.get(id)])

      const popup = labels.current.get(id)
      if (!popup) return
      if (active && !popup.isOpen()) popup.addTo(map.current)
      if (!active && popup.isOpen()) popup.remove()
    })

    areaLabels.current.forEach((popup, id) => {
      const active = id === highlightedId
      if (active && !popup.isOpen()) popup.addTo(map.current)
      if (!active && popup.isOpen()) popup.remove()
    })

    if (styleReady.current && map.current.getLayer(`${AREA_SOURCE}-fill`)) {
      const isActive = [ "==", [ "get", "id" ], highlightedId || "" ]
      map.current.setPaintProperty(`${AREA_SOURCE}-fill`, "fill-opacity",
        [ "case", isActive, 0.34, 0.18 ])
      map.current.setPaintProperty(`${AREA_SOURCE}-line`, "line-color",
        [ "case", isActive, "#f2b640", [ "get", "color" ] ])
      map.current.setPaintProperty(`${AREA_SOURCE}-fill`, "fill-color",
        [ "case", isActive, "#f2b640", [ "get", "color" ] ])
    }
  }, [highlightedId, nodes])

  return <div ref={container} className="home-map" />
}
