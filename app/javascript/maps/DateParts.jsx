import React from "react"

// MM / DD / YYYY / Era for one date. Exact insists on all three parts;
// approximate and disputed settle for a year.
export default function DateParts({ prefix, label, kind, draft, eras, onChange, required = true }) {
  const wholeDate = kind === "exact"
  const field = (part) => `${prefix}_${part}`
  const set = (part) => (event) => onChange({ ...draft, [field(part)]: event.target.value })

  const star = <span className="form__required" aria-hidden="true">*</span>

  return (
    <div className="form__row form__row--date" aria-label={label}>
      <div className="form__field">
        <label htmlFor={`node-${field("month")}`} className="form__sublabel">
          MM {required && wholeDate && star}
        </label>
        <input
          id={`node-${field("month")}`}
          type="number"
          inputMode="numeric"
          required={required && wholeDate}
          min="1"
          max="12"
          placeholder="MM"
          className="form__input"
          value={draft[field("month")] || ""}
          onChange={set("month")}
        />
      </div>

      <div className="form__field">
        <label htmlFor={`node-${field("day")}`} className="form__sublabel">
          DD {required && wholeDate && star}
        </label>
        <input
          id={`node-${field("day")}`}
          type="number"
          inputMode="numeric"
          required={required && wholeDate}
          min="1"
          max="31"
          placeholder="DD"
          className="form__input"
          value={draft[field("day")] || ""}
          onChange={set("day")}
        />
      </div>

      <div className="form__field form__field--year">
        <label htmlFor={`node-${field("year")}`} className="form__sublabel">
          YYYY {required && star}
        </label>
        <input
          id={`node-${field("year")}`}
          type="number"
          inputMode="numeric"
          required={required}
          min="1"
          max="4000"
          placeholder="YYYY"
          className="form__input"
          value={draft[field("year")] || ""}
          onChange={set("year")}
        />
      </div>

      <div className="form__field form__field--era">
        <label htmlFor={`node-${field("era")}`} className="form__sublabel">Era</label>
        <select
          id={`node-${field("era")}`}
          className="form__input form__select"
          value={draft[field("era")] || "AD"}
          onChange={set("era")}
        >
          {eras.map((era) => <option key={era} value={era}>{era}</option>)}
        </select>
      </div>
    </div>
  )
}
