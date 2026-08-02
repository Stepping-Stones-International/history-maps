import React from "react"

// The shapes the map draws, drawn the same way here so the form shows exactly
// what will land on the map. Sized by its box, coloured by the marker.
export default function MarkerIcon({ shape, color, size = 16 }) {
  const common = { width: size, height: size, "aria-hidden": true, className: "marker-icon" }

  if (shape === "circle") {
    return (
      <svg {...common} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill={color} />
      </svg>
    )
  }

  return (
    <svg {...common} viewBox="0 0 20 18">
      <polygon points="0,0 20,0 10,18" fill={color} />
    </svg>
  )
}
