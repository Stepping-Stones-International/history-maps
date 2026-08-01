import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"

export default function Modal({ title, onClose, children }) {
  const panel = useRef(null)
  // Held in a ref so a new onClose identity does not re-run the effects below.
  const close = useRef(onClose)
  close.current = onClose

  // Mount only. Re-running this would pull focus out of whatever the user is
  // typing in every time the parent re-renders.
  useEffect(() => {
    panel.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") close.current()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
      >
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="icon-button icon-button--small"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="icon-button__glyph" />
          </button>
        </header>

        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
