import React, { useState } from "react"
import { Crosshair } from "lucide-react"

// Controlled by the page so the values survive the modal being hidden while
// coordinates are picked off the map.
export default function NodeForm({
  draft, dateTypes, eras, parentOptions = [], onChange, onPickOnMap, onCancel, onSubmit
}) {
  // Exact wants a whole date; approximate settles for a year. An embedded node
  // takes its moment from its parent, so nothing is required of it.
  const embedded = Boolean(draft.parent_id)
  const collectsDate = ["exact", "approximate"].includes(draft.date_type)
  const requiresFullDate = draft.date_type === "exact" && !embedded
  const requiresYear = collectsDate && !embedded

  // Revealed by the checkbox; seeded open for a node that is already embedded.
  const [embedding, setEmbedding] = useState(Boolean(draft.parent_id))

  // Embedding defaults to no date; detaching gives a dateless node one back,
  // since "No Date" is not offered to a node of its own.
  const toggleEmbedding = (event) => {
    const wanted = event.target.checked
    setEmbedding(wanted)

    if (wanted) {
      onChange({ ...draft, date_type: "none" })
    } else {
      onChange({
        ...draft,
        parent_id: "",
        date_type: draft.date_type === "none" ? "exact" : draft.date_type
      })
    }
  }

  // A layer groups things rather than marking a place, so it takes no
  // coordinates; ticking it clears and disables them.
  const isLayer = Boolean(draft.layer)

  const toggleLayer = (event) => {
    const wanted = event.target.checked
    onChange(wanted
      ? { ...draft, layer: true, latitude: "", longitude: "" }
      : { ...draft, layer: false, area_json: "" })
  }

  const typeOptions = embedding
    ? dateTypes
    : dateTypes.filter((option) => option.value !== "none")

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
        <label className="form__check">
          <input
            type="checkbox"
            className="form__checkbox"
            checked={embedding}
            onChange={toggleEmbedding}
          />
          Embed this under another node
        </label>
      </div>

      {embedding && (
      <div className="form__row">
        <div className="form__field">
          <label htmlFor="node-parent" className="form__label">Embedded under</label>
          <select
            id="node-parent"
            className="form__input form__select"
            value={draft.parent_id || ""}
            onChange={set("parent_id")}
          >
            <option value="">Nothing — a node of its own</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
        </div>

        <div className="form__field form__field--position">
          <label htmlFor="node-position" className="form__label">Order</label>
          <input
            id="node-position"
            type="number"
            min="1"
            step="1"
            className="form__input"
            value={draft.position ?? ""}
            onChange={set("position")}
          />
        </div>
      </div>
      )}

      <div className="form__field">
        <label htmlFor="node-date-type" className="form__label">Date type</label>
        <select
          id="node-date-type"
          className="form__input form__select"
          value={draft.date_type}
          onChange={setDateType}
        >
          {typeOptions.map(({ value, label }) => (
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
                YYYY {requiresYear && <span className="form__required" aria-hidden="true">*</span>}
              </label>
              <input
                id="node-occurred-year"
                type="number"
                inputMode="numeric"
                required={requiresYear}
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
            required={!isLayer}
            disabled={isLayer}
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
            required={!isLayer}
            disabled={isLayer}
            className="form__input"
            value={draft.longitude}
            onChange={set("longitude")}
          />
        </div>

        <button
          type="button"
          className="icon-button icon-button--small form__row-action"
          onClick={onPickOnMap}
          disabled={isLayer}
          aria-label="Pick coordinates on the map"
          title="Pick coordinates on the map"
        >
          <Crosshair className="icon-button__glyph" />
        </button>
      </div>


      <div className="form__field">
        <label className="form__check">
          <input
            type="checkbox"
            className="form__checkbox"
            checked={isLayer}
            onChange={toggleLayer}
          />
          Layer
        </label>
      </div>

      {isLayer && (
        <div className="form__field">
          <label htmlFor="node-area" className="form__label">Area outline</label>
          <p className="form__note">
            A ring of [longitude, latitude] pairs. Leave empty for a layer with no shape.
          </p>
          <textarea
            id="node-area"
            rows={5}
            spellCheck={false}
            className="form__input form__input--code"
            placeholder={'[\n  [-117.8672, 33.7501],\n  [-117.8665, 33.7508],\n  [-117.8657, 33.7514]\n]'}
            value={draft.area_json || ""}
            onChange={set("area_json")}
          />
        </div>
      )}

      <div className="form__actions">
        <button type="button" className="button button--text" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  )
}
