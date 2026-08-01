import React from "react"
import { Crosshair } from "lucide-react"

// Controlled by the page so the values survive the modal being hidden while
// coordinates are picked off the map.
export default function NewNodeForm({ draft, dateTypes, onChange, onPickOnMap, onCancel, onSubmit }) {
  const set = (field) => (event) => onChange({ ...draft, [field]: event.target.value })

  // Clear the date when it stops applying, so a hidden field is not submitted.
  const setDateType = (event) => {
    const date_type = event.target.value
    onChange({ ...draft, date_type, occurred_on: date_type === "exact" ? draft.occurred_on : "" })
  }

  const submit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={submit} className="form">
      <div className="form__field">
        <label htmlFor="node-date-type" className="form__label">Date type</label>
        <select
          id="node-date-type"
          className="form__input form__select"
          value={draft.date_type}
          onChange={setDateType}
        >
          {dateTypes.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {draft.date_type === "exact" && (
        <div className="form__field">
          <label htmlFor="node-occurred-on" className="form__label">Date</label>
          <input
            id="node-occurred-on"
            type="text"
            inputMode="numeric"
            placeholder="MM-DD-YYYY"
            pattern="\d{2}-\d{2}-\d{4}"
            title="Use MM-DD-YYYY"
            className="form__input"
            value={draft.occurred_on}
            onChange={set("occurred_on")}
          />
        </div>
      )}

      <div className="form__field">
        <label htmlFor="node-title" className="form__label">Title</label>
        <input
          id="node-title"
          type="text"
          required
          autoFocus
          className="form__input"
          value={draft.title}
          onChange={set("title")}
        />
      </div>

      <div className="form__field">
        <label htmlFor="node-description" className="form__label">Description</label>
        <textarea
          id="node-description"
          rows={4}
          className="form__input"
          value={draft.description}
          onChange={set("description")}
        />
      </div>

      <div className="form__row">
        <div className="form__field">
          <label htmlFor="node-latitude" className="form__label">Latitude</label>
          <input
            id="node-latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            className="form__input"
            value={draft.latitude}
            onChange={set("latitude")}
          />
        </div>

        <div className="form__field">
          <label htmlFor="node-longitude" className="form__label">Longitude</label>
          <input
            id="node-longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            className="form__input"
            value={draft.longitude}
            onChange={set("longitude")}
          />
        </div>

        <button
          type="button"
          className="icon-button icon-button--small form__row-action"
          onClick={onPickOnMap}
          aria-label="Pick coordinates on the map"
          title="Pick coordinates on the map"
        >
          <Crosshair className="icon-button__glyph" />
        </button>
      </div>

      <div className="form__actions">
        <button type="button" className="button button--quiet" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  )
}
