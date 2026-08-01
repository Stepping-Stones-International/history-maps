import React, { useState } from "react"
import { ChevronRight, Pencil } from "lucide-react"
import { expandedIds, remember } from "../lib/expandedNodes"

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

function Row({ node, childrenOf, expanded, onToggle, highlightedId, onHighlight, onEdit, depth }) {
  const embedded = childrenOf(node.id)
  const hasEmbedded = embedded.length > 0
  const isOpen = expanded.has(node.id)
  // Only embedded nodes carry a meaningful order, and only once one is set.
  const index = node.parent_id && node.position > 0 ? node.position : null

  return (
    <li className="node-list__branch">
      <div
        className={`node-list__item ${node.id === highlightedId ? "node-list__item--active" : ""}`}
        style={{ marginLeft: `${depth * 0.85}rem` }}
      >
        {hasEmbedded ? (
          <button
            type="button"
            className={`node-list__toggle ${isOpen ? "node-list__toggle--open" : ""}`}
            onClick={() => onToggle(node.id)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.title}`}
          >
            <ChevronRight className="node-list__caret" />
          </button>
        ) : (
          <span className="node-list__toggle-space" aria-hidden="true" />
        )}

        <button
          type="button"
          className="node-list__select"
          onClick={() => onHighlight(node)}
          aria-pressed={node.id === highlightedId}
        >
          <span className="node-list__title">
            {index && <span className="node-list__index">{index}.</span>}
            <span className="node-list__label">{node.title}</span>
          </span>
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

      {hasEmbedded && isOpen && (
        <ol className="node-list__embedded">
          {embedded.map((child) => (
            <Row
              key={child.id}
              node={child}
              childrenOf={childrenOf}
              expanded={expanded}
              onToggle={onToggle}
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
  // Closed unless this browser remembers it being opened.
  const [expanded, setExpanded] = useState(expandedIds)

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      const opening = !next.has(id)

      if (opening) next.add(id)
      else next.delete(id)

      remember(id, opening)
      return next
    })
  }

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
          expanded={expanded}
          onToggle={toggle}
          highlightedId={highlightedId}
          onHighlight={onHighlight}
          onEdit={onEdit}
          depth={0}
        />
      ))}
    </ul>
  )
}
