import React from "react"
import { useForm } from "@inertiajs/react"

export default function NewTopicForm({ onCancel }) {
  const form = useForm({ title: "", description: "" })

  const submit = (event) => {
    event.preventDefault()
    // On success the server redirects to the topic's map; on failure it
    // redirects back here and Inertia fills form.errors, leaving this open.
    form.post("/topics")
  }

  return (
    <form onSubmit={submit} className="form">
      <div className="form__field">
        <label htmlFor="title" className="form__label">Title</label>
        <input
          id="title"
          type="text"
          required
          autoFocus
          className="form__input"
          value={form.data.title}
          onChange={(e) => form.setData("title", e.target.value)}
        />
        {form.errors.title && <p className="form__error">{form.errors.title}</p>}
      </div>

      <div className="form__field">
        <label htmlFor="description" className="form__label">Description</label>
        <textarea
          id="description"
          rows={4}
          className="form__input"
          value={form.data.description}
          onChange={(e) => form.setData("description", e.target.value)}
        />
        {form.errors.description && <p className="form__error">{form.errors.description}</p>}
      </div>

      <div className="form__actions">
        <button type="button" className="button button--quiet" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button" disabled={form.processing}>
          {form.processing ? "Creating…" : "Create topic"}
        </button>
      </div>
    </form>
  )
}
