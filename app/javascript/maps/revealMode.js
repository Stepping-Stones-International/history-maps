import { walkOrder } from "./timelineWalk"

// How much of the topic the map shows while the timeline is walked.
export const REVEAL_MODES = [
  { value: "all", label: "Show All" },
  { value: "step", label: "Step Through" },
  { value: "isolated", label: "Isolated" }
]

export const DEFAULT_REVEAL_MODE = "all"

// What the mode alone would draw, before anything is toggled by hand.
//
// "step" builds the topic up one node at a time as the timeline is walked:
// everything from the start of the walk through the node being looked at,
// embedded nodes included, since they are steps of their own. "isolated"
// keeps only the one being looked at. Both start empty, since nothing has
// been reached yet, and neither draws a loose undated node: it has no place
// on the line to be reached from.
function revealedIds(nodes, mode, highlightedId) {
  if (mode !== "step" && mode !== "isolated") return new Set(nodes.map((node) => node.id))
  if (!highlightedId) return new Set()
  if (mode === "isolated") return new Set([ highlightedId ])

  const order = walkOrder(nodes)
  const reached = order.findIndex((node) => node.id === highlightedId)

  return reached === -1 ? new Set() : new Set(order.slice(0, reached + 1).map((node) => node.id))
}

// Which nodes belong on the map right now.
//
// A node toggled by hand in the sidebar holds whatever it was told, on or
// off, whatever the mode would otherwise do with it. Everything untouched
// follows the mode.
export function visibleNodes(
  nodes = [], mode = DEFAULT_REVEAL_MODE, highlightedId = null, overrides = new Map()
) {
  const revealed = revealedIds(nodes, mode, highlightedId)

  return nodes.filter((node) =>
    (overrides.has(node.id) ? overrides.get(node.id) : revealed.has(node.id))
  )
}
