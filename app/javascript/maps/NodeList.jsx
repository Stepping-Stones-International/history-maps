import React, { useEffect, useRef, useState } from "react"
import { ChevronRight, Layers, Pencil } from "lucide-react"
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

// Everything embedded under a node, however deeply.
function descendantsOf(id, childrenOf) {
  return childrenOf(id).flatMap((child) => [ child, ...descendantsOf(child.id, childrenOf) ])
}

// A checkbox that is neither on nor off: some of what it covers is drawn.
function PartialCheckbox({ partial, ...props }) {
  const box = useRef(null)

  useEffect(() => {
    if (box.current) box.current.indeterminate = partial
  }, [ partial ])

  return <input ref={box} type="checkbox" {...props} />
}

function Row({
  node, childrenOf, expanded, onToggle, highlightedId, onHighlight, onEdit, depth,
  visibleIds, onVisibilityChange
}) {
  const embedded = childrenOf(node.id)
  const hasEmbedded = embedded.length > 0
  const isOpen = expanded.has(node.id)
  // Only embedded nodes carry a meaningful order, and only once one is set.
  const index = node.parent_id && node.position > 0 ? node.position : null

  // The aggregate control is rendered as index 0 inside the expanded sublist.
  const embeds = hasEmbedded ? descendantsOf(node.id, childrenOf) : []
  const shownEmbeds = embeds.filter((child) => visibleIds.has(child.id)).length
  const allEmbeds = hasEmbedded && shownEmbeds === embeds.length

  return (
    <li className="node-list__branch">
      <div
        className={`node-list__item ${node.id === highlightedId ? "node-list__item--active" : ""}`}
        style={{ marginLeft: `${depth * 0.85}rem` }}
      >
        {/* Ticked while the node is on the map: unticking takes it off, and
            stepping onto it ticks itself back on. */}
        <input
          type="checkbox"
          className="node-list__visible"
          checked={visibleIds.has(node.id)}
          onChange={(event) => onVisibilityChange([ node ], event.target.checked)}
          aria-label={`Show ${node.title} on the map`}
          title="Show on the map"
        />

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
          <li className="node-list__branch">
            <div className="node-list__item node-list__item--embedded-all">
              <PartialCheckbox
                className="node-list__visible"
                checked={allEmbeds}
                partial={shownEmbeds > 0 && !allEmbeds}
                onChange={() => onVisibilityChange(embeds, !allEmbeds)}
                aria-label={`Show everything embedded under ${node.title} on the map`}
                title="Show embedded nodes on the map"
              />
              <span className="node-list__toggle-space" aria-hidden="true" />
              <span className="node-list__select node-list__embedded-all-label">
                <span className="node-list__title">
                  <span className="node-list__index">0.</span>
                  <Layers className="node-list__embeds-glyph" aria-hidden="true" />
                  <span className="node-list__label">All embedded nodes</span>
                </span>
              </span>
            </div>
          </li>
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
              visibleIds={visibleIds}
              onVisibilityChange={onVisibilityChange}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

export default function NodeList({
  nodes, highlightedId, onHighlight, onEdit, visibleIds, onVisibilityChange
}) {
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
          visibleIds={visibleIds}
          onVisibilityChange={onVisibilityChange}
        />
      ))}
    </ul>
  )
}
