import { walkOrder } from "./timelineWalk"

// How much of the topic the map shows while the timeline is walked.
export const REVEAL_MODES = [
  { value: "all", label: "Show All" },
  { value: "step", label: "Step Through" },
  { value: "isolated", label: "Isolated" }
]

export const DEFAULT_REVEAL_MODE = "all"

// Which nodes belong on the map right now.
//
// "step" builds the topic up one node at a time as the timeline is walked:
// everything from the start of the walk through the node being looked at,
// embedded nodes included, since they are steps of their own. "isolated"
// keeps only the one being looked at. Both start empty, since nothing has
// been reached yet, and neither draws a loose undated node: it has no place
// on the line to be reached from.
//
// A node unticked in the sidebar stays off the map in every mode.
export function visibleNodes(
  nodes = [], mode = DEFAULT_REVEAL_MODE, highlightedId = null, hiddenIds = new Set()
) {
  const shown = nodes.filter((node) => !hiddenIds.has(node.id))

  if (mode !== "step" && mode !== "isolated") return shown
  if (!highlightedId) return []

  if (mode === "isolated") return shown.filter((node) => node.id === highlightedId)

  // The walk covers every node, so unticking one does not shuffle the rest
  // along; it just leaves a gap.
  const order = walkOrder(nodes)
  const reached = order.findIndex((node) => node.id === highlightedId)
  if (reached === -1) return []

  const revealed = new Set(order.slice(0, reached + 1).map((node) => node.id))

  return shown.filter((node) => revealed.has(node.id))
}
