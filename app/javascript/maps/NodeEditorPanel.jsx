import React from "react"
import { X } from "lucide-react"
import NodeForm from "./NodeForm"
import PopoutResizeHandle from "./PopoutResizeHandle"

export default function NodeEditorPanel({
  node, width, onWidthChange, draft, dateTypes, rangeTypes, eras, markers, parentOptions,
  onChange, onPickOnMap, onCancel, onSubmit
}) {
  if (!node) return null

  return (
    <aside className="node-editor" style={{ width }} aria-label={`Edit ${node.title}`}>
      <header className="node-editor__header">
        <div className="node-editor__heading">
          <h2 className="node-editor__title">Edit node</h2>
          <p className="node-editor__subtitle">{node.title}</p>
        </div>
        <button
          type="button"
          className="node-editor__close"
          onClick={onCancel}
          aria-label="Close editor"
          title="Close"
        >
          <X className="node-editor__close-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="node-editor__body">
        <NodeForm
          draft={draft}
          dateTypes={dateTypes}
          rangeTypes={rangeTypes}
          eras={eras}
          markers={markers}
          parentOptions={parentOptions}
          onChange={onChange}
          onPickOnMap={onPickOnMap}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </div>

      <PopoutResizeHandle width={width} onWidthChange={onWidthChange} />
    </aside>
  )
}
