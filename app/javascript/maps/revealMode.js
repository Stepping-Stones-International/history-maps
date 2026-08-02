import { datedNodes } from "./timelineScale"

// How much of the topic the map shows while the timeline is walked.
export const REVEAL_MODES = [
  { value: "all", label: "Show All" },
  { value: "step", label: "Step Through" },
  { value: "isolated", label: "Isolated" }
]

export const DEFAULT_REVEAL_MODE = "all"

// Everything embedded under the given nodes, however deeply.
function withEmbedded(nodes, chosen) {
  const shown = new Map(chosen.map((node) => [ node.id, node ]))
  let added = true

  while (added) {
    added = false

    nodes.forEach((node) => {
      if (shown.has(node.id) || !node.parent_id || !shown.has(node.parent_id)) return
      shown.set(node.id, node)
      added = true
    })
  }

  return nodes.filter((node) => shown.has(node.id))
}

// Which nodes belong on the map right now.
//
// "step" builds the topic up as the timeline is walked: everything from the
// earliest plot through the one being looked at, along with whatever is
// embedded under those — an embedded node need carry no date of its own, so
// it arrives with its parent rather than through the line. "isolated" keeps
// only the one being looked at. Both start empty, since nothing has been
// reached yet, and neither draws a loose undated node: it has no place on
// the line to be reached from.
export function visibleNodes(nodes = [], mode = DEFAULT_REVEAL_MODE, highlightedId = null) {
  if (mode !== "step" && mode !== "isolated") return nodes
  if (!highlightedId) return []

  if (mode === "isolated") return nodes.filter((node) => node.id === highlightedId)

  const ordered = datedNodes(nodes).map(({ node }) => node)
  const reached = ordered.findIndex((node) => node.id === highlightedId)
  if (reached === -1) return []

  return withEmbedded(nodes, ordered.slice(0, reached + 1))
}
