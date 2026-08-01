import React from "react"
import { usePage } from "@inertiajs/react"
import { Crosshair } from "lucide-react"
import FormErrors from "../components/FormErrors"

// Controlled by the page so the values survive the modal being hidden while
// the map is moved to the view worth remembering.
export default function TopicSettingsForm({ draft, onChange, onSetView, onCancel, onSubmit }) {
  const { errors } = usePage().props
  const set = (field) => (event) => onChange({ ...draft, [field]: event.target.value })

  const hasView = [ draft.center_latitude, draft.center_longitude, draft.zoom ]
    .every((part) => part !== "" && part !== null && part !== undefined)

  const submit = (event) => {
    event.preventDefault()
    onSubmit()
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
          value={draft.title}
          onChange={set("title")}
        />
      </div>

      <div className="form__field">
        <label htmlFor="topic-description" className="form__label">Description</label>
        <textarea
          id="topic-description"
          rows={4}
          className="form__input"
          value={draft.description}
          onChange={set("description")}
        />
      </div>

      <div className="form__field">
        <span className="form__label">Opening view</span>

        <p className="form__note">
          {hasView
            ? `Centred on ${draft.center_latitude}, ${draft.center_longitude} at zoom ${draft.zoom}.`
            : "Opens on the whole region until you set one."}
        </p>

        <button type="button" className="button button--wide" onClick={onSetView}>
          <Crosshair className="button__glyph" aria-hidden="true" />
          Set map location and zoom
        </button>
      </div>

      <div className="form__actions">
        <button type="button" className="button button--text" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  )
}
