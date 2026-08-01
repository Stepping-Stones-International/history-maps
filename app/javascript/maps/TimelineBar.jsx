import React from "react"

// Sits over the map, spanning 80% of the space left of the drawer. The offset
// follows the drawer so the bar recentres when it collapses.
export default function TimelineBar({ drawerOpen }) {
  return (
    <div className={`timeline ${drawerOpen ? "timeline--inset" : ""}`}>
      <div className="timeline__bar" role="group" aria-label="Timeline">
        <div className="timeline__track" />
      </div>
    </div>
  )
}
