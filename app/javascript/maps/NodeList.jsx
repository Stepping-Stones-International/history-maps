import React from "react"
import { Pencil } from "lucide-react"

// The server sends the nodes flat, already ordered; this nests them.
function nest(nodes) {
  const children = new Map()
  nodes.forEach((node) => {
    const key = node.parent_id || null
    if (!children.has(key)) children.set(key, [])
    children.get(key).push(node)
  })

  return { roots: children.get(null) || [], childrenOf: (id) => children.get(id) || [] }
}

function Row({ node, childrenOf, highlightedId, onHighlight, onEdit, depth }) {
  const embedded = childrenOf(node.id)

  return (
    <li className="node-list__branch">
      <div
        className={`node-list__item ${node.id === highlightedId ? "node-list__item--active" : ""}`}
        style={{ marginLeft: `${depth * 0.85}rem` }}
      >
        <button
          type="button"
          className="node-list__select"
          onClick={() => onHighlight(node)}
          aria-pressed={node.id === highlightedId}
        >
          <span className="node-list__title">{node.title}</span>
          {node.date_display && (
            <span className="node-list__date">{node.date_display}</span>
          )}
        </button>

        <button
          type="button"
          className="icon-button icon-button--small node-list__edit"
          onClick={() => onEdit(node)}
          aria-label={`Edit ${node.title}`}
          title="Edit"
        >
          <Pencil className="icon-button__glyph" />
        </button>
      </div>

      {embedded.length > 0 && (
        <ol className="node-list__embedded">
          {embedded.map((child) => (
            <Row
              key={child.id}
              node={child}
              childrenOf={childrenOf}
              highlightedId={highlightedId}
              onHighlight={onHighlight}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

export default function NodeList({ nodes, highlightedId, onHighlight, onEdit }) {
  if (nodes.length === 0) {
    return <p className="node-list__empty">No nodes yet.</p>
  }

  const { roots, childrenOf } = nest(nodes)

  return (
    <ul className="node-list">
      {roots.map((node) => (
        <Row
          key={node.id}
          node={node}
          childrenOf={childrenOf}
          highlightedId={highlightedId}
          onHighlight={onHighlight}
          onEdit={onEdit}
          depth={0}
        />
      ))}
    </ul>
  )
}
