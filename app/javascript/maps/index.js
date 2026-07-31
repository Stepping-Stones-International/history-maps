import React from "react"
import { createRoot } from "react-dom/client"
import HomeMap from "./HomeMap"

const roots = new WeakMap()

function mount() {
  const el = document.getElementById("home-map")
  if (!el || roots.has(el)) return

  const root = createRoot(el)
  roots.set(el, root)
  root.render(React.createElement(HomeMap))
}

document.addEventListener("turbo:load", mount)
document.addEventListener("DOMContentLoaded", mount)
