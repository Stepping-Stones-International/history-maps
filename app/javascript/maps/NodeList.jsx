import React from "react"
import { Pencil } from "lucide-react"

export default function NodeList({ nodes, highlightedId, onHighlight, onEdit }) {
  if (nodes.length === 0) {
    return <p className="node-list__empty">No nodes yet.</p>
  }

  return (
    <ul className="node-list">
      {nodes.map((node) => (
        <li
          key={node.id}
          className={`node-list__item ${node.id === highlightedId ? "node-list__item--active" : ""}`}
        >
          {/* Selecting shows the node on the map; the pencil is what edits. */}
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
        </li>
      ))}
    </ul>
  )
}
