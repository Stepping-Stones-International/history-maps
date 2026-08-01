import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buildScale } from "./timelineScale"

// Sits over the map, spanning 80% of the space left of the drawer. The offset
// follows the drawer so the bar recentres when it collapses.
export default function TimelineBar({ nodes = [], drawerOpen, onStepBack, onStepForward }) {
  // Null until two nodes carry different dates: nothing to space out before then.
  const scale = buildScale(nodes)

  return (
    <div className={`timeline ${drawerOpen ? "timeline--inset" : ""}`}>
      <div className="timeline__bar" role="group" aria-label="Timeline">
        <button
          type="button"
          className="icon-button icon-button--small timeline__step"
          onClick={onStepBack}
          disabled={!onStepBack}
          aria-label="Step back"
          title="Step back"
        >
          <ChevronLeft className="icon-button__glyph" />
        </button>

        <div className="timeline__track">
          <div className="timeline__rule" />

          {scale?.ticks.map(({ year, left }) => (
            <span
              key={`tick-${year}`}
              className="timeline__tick"
              style={{ left: `${left}%` }}
              aria-hidden="true"
            />
          ))}

          {scale?.epochs.map(({ node, left }) => (
            <span key={node.id} className="timeline__epoch" style={{ left: `${left}%` }}>
              <span className="timeline__epoch-label">{node.date_display}</span>
              <span className="timeline__epoch-line" />
            </span>
          ))}
        </div>

        <button
          type="button"
          className="icon-button icon-button--small timeline__step"
          onClick={onStepForward}
          disabled={!onStepForward}
          aria-label="Step forward"
          title="Step forward"
        >
          <ChevronRight className="icon-button__glyph" />
        </button>
      </div>
    </div>
  )
}
