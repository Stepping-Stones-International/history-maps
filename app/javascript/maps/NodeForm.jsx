import React from "react"
import { Crosshair } from "lucide-react"

// Controlled by the page so the values survive the modal being hidden while
// coordinates are picked off the map.
export default function NodeForm({
  draft, dateTypes, eras, onChange, onPickOnMap, onCancel, onSubmit
}) {
  // Exact wants a whole date; approximate settles for a year.
  const collectsDate = ["exact", "approximate"].includes(draft.date_type)
  const requiresFullDate = draft.date_type === "exact"

  const set = (field) => (event) => onChange({ ...draft, [field]: event.target.value })

  // Clear the date when it stops applying, so hidden fields are not submitted.
  const setDateType = (event) => {
    const date_type = event.target.value
    const keepsDate = ["exact", "approximate"].includes(date_type)
    const cleared = keepsDate
      ? {}
      : { occurred_month: "", occurred_day: "", occurred_year: "", era: "AD" }

    onChange({ ...draft, date_type, ...cleared })
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

      {/* The fieldset is named for screen readers only; the MM/DD/YYYY
          sublabels carry it visually. */}
      {collectsDate && (
        <fieldset className="form__fieldset" aria-label="Date">
          <div className="form__row form__row--date">
            <div className="form__field">
              <label htmlFor="node-occurred-month" className="form__sublabel">
                MM {requiresFullDate && <span className="form__required" aria-hidden="true">*</span>}
              </label>
              <input
                id="node-occurred-month"
                type="number"
                inputMode="numeric"
                required={requiresFullDate}
                min="1"
                max="12"
                placeholder="MM"
                className="form__input"
                value={draft.occurred_month}
                onChange={set("occurred_month")}
              />
            </div>

            <div className="form__field">
              <label htmlFor="node-occurred-day" className="form__sublabel">
                DD {requiresFullDate && <span className="form__required" aria-hidden="true">*</span>}
              </label>
              <input
                id="node-occurred-day"
                type="number"
                inputMode="numeric"
                required={requiresFullDate}
                min="1"
                max="31"
                placeholder="DD"
                className="form__input"
                value={draft.occurred_day}
                onChange={set("occurred_day")}
              />
            </div>

            <div className="form__field form__field--year">
              <label htmlFor="node-occurred-year" className="form__sublabel">
                YYYY <span className="form__required" aria-hidden="true">*</span>
              </label>
              <input
                id="node-occurred-year"
                type="number"
                inputMode="numeric"
                required
                min="1"
                max="4000"
                placeholder="YYYY"
                className="form__input"
                value={draft.occurred_year}
                onChange={set("occurred_year")}
              />
            </div>

            <div className="form__field form__field--era">
              <label htmlFor="node-era" className="form__sublabel">Era</label>
              <select
                id="node-era"
                className="form__input form__select"
                value={draft.era}
                onChange={set("era")}
              >
                {eras.map((era) => <option key={era} value={era}>{era}</option>)}
              </select>
            </div>
          </div>
        </fieldset>
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
        <button type="button" className="button button--text" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  )
}
