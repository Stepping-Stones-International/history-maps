import { datedNodes } from "./timelineScale"

// Embedded nodes, in the order their index puts them.
function embedsByParent(nodes) {
  const byParent = new Map()

  nodes.forEach((node) => {
    if (!node.parent_id) return
    byParent.set(node.parent_id, (byParent.get(node.parent_id) || []).concat(node))
  })

  byParent.forEach((embeds) => embeds.sort((a, b) => (a.position || 0) - (b.position || 0)))

  return byParent
}

// The order the timeline is walked when every node counts, not just the ones
// with a plot: each dated node in turn, then whatever is embedded under it,
// however deeply. A dated embed that falls earlier than its parent keeps its
// own place on the line rather than waiting to be reached through it.
export function walkOrder(nodes = []) {
  const byParent = embedsByParent(nodes)
  const seen = new Set()
  const order = []

  const visit = (node) => {
    if (seen.has(node.id)) return

    seen.add(node.id)
    order.push(node)
    ;(byParent.get(node.id) || []).forEach(visit)
  }

  datedNodes(nodes).forEach(({ node }) => visit(node))

  return order
}
