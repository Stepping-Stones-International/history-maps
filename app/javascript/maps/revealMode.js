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
export function visibleNodes(nodes = [], mode = DEFAULT_REVEAL_MODE, highlightedId = null) {
  if (mode !== "step" && mode !== "isolated") return nodes
  if (!highlightedId) return []

  if (mode === "isolated") return nodes.filter((node) => node.id === highlightedId)

  const order = walkOrder(nodes)
  const reached = order.findIndex((node) => node.id === highlightedId)

  return reached === -1 ? [] : order.slice(0, reached + 1)
}
