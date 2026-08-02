import { datedNodes } from "./timelineScale"

// How much of the topic the map shows while the timeline is walked.
export const REVEAL_MODES = [
  { value: "all", label: "Show All" },
  { value: "step", label: "Step Through" },
  { value: "isolated", label: "Isolated" }
]

export const DEFAULT_REVEAL_MODE = "all"

// Which nodes belong on the map right now.
//
// "step" builds the topic up as the timeline is walked: everything from the
// earliest plot through the one being looked at. "isolated" keeps only that
// one. Both start empty, since nothing has been reached yet, and both leave
// out undated nodes — they have no place on the line to be reached from.
export function visibleNodes(nodes = [], mode = DEFAULT_REVEAL_MODE, highlightedId = null) {
  if (mode !== "step" && mode !== "isolated") return nodes
  if (!highlightedId) return []

  if (mode === "isolated") return nodes.filter((node) => node.id === highlightedId)

  const ordered = datedNodes(nodes).map(({ node }) => node)
  const reached = ordered.findIndex((node) => node.id === highlightedId)

  return reached === -1 ? [] : ordered.slice(0, reached + 1)
}
