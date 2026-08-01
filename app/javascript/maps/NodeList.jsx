import React from "react"

export default function NodeList({ nodes, onSelect }) {
  if (nodes.length === 0) {
    return <p className="node-list__empty">No nodes yet.</p>
  }

  return (
    <ul className="node-list">
      {nodes.map((node) => (
        <li key={node.id}>
          <button type="button" className="node-list__item" onClick={() => onSelect(node)}>
            <span className="node-list__title">{node.title}</span>
            {node.date_display && (
              <span className="node-list__date">{node.date_display}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
