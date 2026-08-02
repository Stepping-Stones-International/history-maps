import React, { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import MarkerIcon from "./MarkerIcon"

// A dropdown of the icons a node can carry, each shown beside its name: a
// native select would only take text, and the point is to see the shape and
// colour you are choosing.
export default function MarkerPicker({ markers = [], value, onChange }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  const chosen = markers.find((marker) => marker.value === value) || markers[0]

  // Closing on any click outside, and on Escape, so the list never strands
  // itself open over the rest of the form.
  useEffect(() => {
    if (!open) return undefined

    const closeOutside = (event) => {
      if (!box.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", closeOutside)
    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.removeEventListener("mousedown", closeOutside)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  if (!chosen) return null

  const choose = (marker) => {
    onChange(marker.value)
    setOpen(false)
  }

  return (
    <div className="picker" ref={box}>
      <button
        type="button"
        id="node-marker"
        className="form__input picker__button"
        onClick={() => setOpen((showing) => !showing)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <MarkerIcon shape={chosen.shape} color={chosen.color} />
        <span className="picker__label">{chosen.label}</span>
        <ChevronDown className="picker__caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="picker__list" role="listbox" aria-label="Icon">
          {markers.map((marker) => (
            <li key={marker.value}>
              <button
                type="button"
                role="option"
                aria-selected={marker.value === chosen.value}
                className={`picker__option ${
                  marker.value === chosen.value ? "picker__option--chosen" : ""
                }`}
                onClick={() => choose(marker)}
              >
                <MarkerIcon shape={marker.shape} color={marker.color} />
                <span className="picker__label">{marker.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
