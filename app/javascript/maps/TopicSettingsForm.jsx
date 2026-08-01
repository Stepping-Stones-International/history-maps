import React, { useState } from "react"
import { router, usePage } from "@inertiajs/react"
import FormErrors from "../components/FormErrors"

export default function TopicSettingsForm({ topic, onDone, onCancel }) {
  const { errors } = usePage().props
  const [title, setTitle] = useState(topic.title)
  const [description, setDescription] = useState(topic.description || "")

  const submit = (event) => {
    event.preventDefault()
    router.patch(`/topics/${topic.id}`, { title, description }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={submit} className="form">
      <FormErrors errors={errors} />

      <div className="form__field">
        <label htmlFor="topic-title" className="form__label">
          Name <span className="form__required" aria-hidden="true">*</span>
        </label>
        <input
          id="topic-title"
          type="text"
          required
          autoFocus
          className="form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form__field">
        <label htmlFor="topic-description" className="form__label">Description</label>
        <textarea
          id="topic-description"
          rows={4}
          className="form__input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form__actions">
        <button type="button" className="button button--text" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  )
}
