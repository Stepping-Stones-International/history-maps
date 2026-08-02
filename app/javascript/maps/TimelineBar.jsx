import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buildScale } from "./timelineScale"
import { REVEAL_MODES, DEFAULT_REVEAL_MODE } from "./revealMode"
import { walkOrder } from "./timelineWalk"

// Sits over the map, spanning 80% of the space left of the drawer. The offset
// follows the drawer so the bar recentres when it collapses.
export default function TimelineBar({
  nodes = [], drawerOpen, highlightedId = null, onHighlight, onSelect,
  revealMode = DEFAULT_REVEAL_MODE, onRevealModeChange
}) {
  // Null until two nodes carry different dates: nothing to space out before then.
  const scale = buildScale(nodes)

  // The arrows walk the plots in the order they sit on the line — except while
  // stepping through, where embedded nodes are steps of their own so the map
  // fills in one at a time. With nothing picked out, or with something off the
  // line picked from the sidebar, they start at whichever end they point away
  // from.
  const stops = revealMode === "step"
    ? walkOrder(nodes)
    : (scale?.epochs || []).map(({ node }) => node)
  const current = stops.findIndex((node) => node.id === highlightedId)
  const previous = current === -1 ? stops[stops.length - 1] : stops[current - 1]
  const next = current === -1 ? stops[0] : stops[current + 1]
  const step = (node) => (node && onSelect ? () => onSelect(node) : null)
  const stepBack = step(previous)
  const stepForward = step(next)

  return (
    <div className={`timeline ${drawerOpen ? "timeline--inset" : ""}`}>
      <div className="timeline__modes">
        <label htmlFor="timeline-reveal" className="timeline__modes-label">Reveal</label>
        <select
          id="timeline-reveal"
          className="form__input form__select timeline__modes-select"
          value={revealMode}
          onChange={(event) => onRevealModeChange?.(event.target.value)}
        >
          {REVEAL_MODES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="timeline__bar" role="group" aria-label="Timeline">
        <button
          type="button"
          className="icon-button icon-button--small timeline__step"
          onClick={stepBack}
          disabled={!stepBack}
          aria-label="Step back"
          title={previous ? `Back to ${previous.title}` : "Step back"}
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
          onClick={stepForward}
          disabled={!stepForward}
          aria-label="Step forward"
          title={next ? `On to ${next.title}` : "Step forward"}
        >
          <ChevronRight className="icon-button__glyph" />
        </button>
      </div>
    </div>
  )
}
