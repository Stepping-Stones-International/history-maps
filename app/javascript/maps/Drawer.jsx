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

function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M14 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Drawer({ children }) {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`drawer ${open ? "drawer--open" : "drawer--closed"}`}>
      {/* Icon rail: only shown while the panel is collapsed. */}
      <nav className="drawer__rail" aria-hidden={open}>
        <button
          type="button"
          className="drawer__rail-button"
          onClick={() => setOpen(true)}
          tabIndex={open ? -1 : 0}
          aria-label="Expand BibleMind panel"
          title="Expand"
        >
          <HamburgerIcon />
        </button>
      </nav>

      <div className="drawer__panel" aria-hidden={!open}>
        <header className="drawer__header">
          <h1 className="drawer__title">BibleMind</h1>
          <button
            type="button"
            className="drawer__collapse"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            aria-label="Collapse BibleMind panel"
            title="Collapse"
          >
            <CollapseIcon />
          </button>
        </header>
        <div className="drawer__body">{children}</div>
      </div>
    </aside>
  )
}
