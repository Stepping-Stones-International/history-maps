import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Sits over the map, spanning 80% of the space left of the drawer. The offset
// follows the drawer so the bar recentres when it collapses.
export default function TimelineBar({ drawerOpen, onStepBack, onStepForward }) {
  return (
    <div className={`timeline ${drawerOpen ? "timeline--inset" : ""}`}>
      <div className="timeline__bar" role="group" aria-label="Timeline">
        <button
          type="button"
          className="icon-button icon-button--small timeline__step"
          onClick={onStepBack}
          aria-label="Step back"
          title="Step back"
        >
          <ChevronLeft className="icon-button__glyph" />
        </button>

        <div className="timeline__track" />

        <button
          type="button"
          className="icon-button icon-button--small timeline__step"
          onClick={onStepForward}
          aria-label="Step forward"
          title="Step forward"
        >
          <ChevronRight className="icon-button__glyph" />
        </button>
      </div>
    </div>
  )
}
