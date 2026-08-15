import React from "react"
import { Pencil, X } from "lucide-react"
import PopoutResizeHandle from "./PopoutResizeHandle"

function coordinateText(node) {
  if (node.latitude == null || node.longitude == null) return null

  return `${Number(node.latitude).toFixed(4)}, ${Number(node.longitude).toFixed(4)}`
}

export default function NodeDetailPanel({ node, width, onWidthChange, onEdit, onClose }) {
  if (!node) return null

  const coordinates = coordinateText(node)
  const details = node.description || "<p>No details have been added for this node.</p>"

  return (
    <aside className="node-detail" style={{ width }} aria-label={`${node.title} details`}>
      <header className="node-detail__header">
        <div className="node-detail__heading">
          <h2 className="node-detail__title">{node.title}</h2>
          {node.date_display && <p className="node-detail__date">{node.date_display}</p>}
        </div>
        <div className="node-detail__actions">
          <button
            type="button"
            className="node-detail__action"
            onClick={() => onEdit?.(node)}
            aria-label={`Edit ${node.title}`}
            title="Edit"
          >
            <Pencil className="node-detail__action-icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="node-detail__action"
            onClick={onClose}
            aria-label="Close details"
            title="Close"
          >
            <X className="node-detail__action-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="node-detail__body">
        <section className="node-detail__section">
          <div
            className="node-detail__text rich-text"
            dangerouslySetInnerHTML={{ __html: details }}
          />
        </section>

        <dl className="node-detail__meta">
          {coordinates && (
            <div className="node-detail__meta-row">
              <dt>Location</dt>
              <dd>{coordinates}</dd>
            </div>
          )}
          <div className="node-detail__meta-row">
            <dt>Type</dt>
            <dd>{node.layer ? "Layer" : "Node"}</dd>
          </div>
        </dl>
      </div>

      <PopoutResizeHandle width={width} onWidthChange={onWidthChange} />
    </aside>
  )
}
