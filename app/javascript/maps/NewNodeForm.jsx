import React, { useState } from "react"

// Collects the details only; the coordinates come from the map click that follows.
export default function NewNodeForm({ onCancel, onReady }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const submit = (event) => {
    event.preventDefault()
    onReady({ title: title.trim(), description: description.trim() })
  }

  return (
    <form onSubmit={submit} className="form">
      <div className="form__field">
        <label htmlFor="node-title" className="form__label">Title</label>
        <input
          id="node-title"
          type="text"
          required
          autoFocus
          className="form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form__field">
        <label htmlFor="node-description" className="form__label">Description</label>
        <textarea
          id="node-description"
          rows={4}
          className="form__input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form__actions">
        <button type="button" className="button button--quiet" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button">Place on map</button>
      </div>
    </form>
  )
}
