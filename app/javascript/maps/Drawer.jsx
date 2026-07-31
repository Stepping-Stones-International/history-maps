import React, { useState } from "react"

export default function Drawer({ children }) {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`drawer ${open ? "drawer--open" : "drawer--closed"}`}>
      <div className="drawer__panel">
        <header className="drawer__header">
          <h1 className="drawer__title">BibleMind</h1>
        </header>
        <div className="drawer__body">{children}</div>
      </div>

      <button
        type="button"
        className="drawer__toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Collapse BibleMind panel" : "Expand BibleMind panel"}
      >
        {open ? "‹" : "›"}
      </button>
    </aside>
  )
}
