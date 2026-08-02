import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buildScale } from "./timelineScale"

// Sits over the map, spanning 80% of the space left of the drawer. The offset
// follows the drawer so the bar recentres when it collapses.
export default function TimelineBar({
  nodes = [], drawerOpen, highlightedId = null, onHighlight, onStepBack, onStepForward
}) {
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

          {/* Each plot picks out its node, the same as its row in the sidebar. */}
          {scale?.epochs.map(({ node, left, right }) => {
            const active = node.id === highlightedId
            const plot = right === null ? "epoch" : "span"

            return (
              <button
                type="button"
                key={node.id}
                className={`timeline__${plot} ${active ? `timeline__${plot}--active` : ""}`}
                style={
                  right === null
                    ? { left: `${left}%` }
                    : { left: `${left}%`, width: `${Math.max(right - left, 0.4)}%` }
                }
                onClick={() => onHighlight?.(node)}
                aria-pressed={active}
                title={`${node.title} — ${node.date_display}`}
              >
                <span className={`timeline__${plot}-label`}>{node.date_display}</span>
                <span className={`timeline__${plot}-${right === null ? "line" : "bar"}`} />
              </button>
            )
          })}
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
