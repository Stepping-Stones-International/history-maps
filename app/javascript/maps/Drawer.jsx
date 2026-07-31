import React, { useState } from "react"

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Drawer({ children }) {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`drawer ${open ? "drawer--open" : "drawer--closed"}`}>
      {/* Always visible, even when collapsed. */}
      <nav className="drawer__rail">
        <button
          type="button"
          className="drawer__rail-button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Collapse BibleMind panel" : "Expand BibleMind panel"}
          title={open ? "Collapse" : "Expand"}
        >
          <HamburgerIcon />
        </button>
      </nav>

      <div className="drawer__panel">
        <header className="drawer__header">
          <h1 className="drawer__title">BibleMind</h1>
        </header>
        <div className="drawer__body">{children}</div>
      </div>
    </aside>
  )
}
