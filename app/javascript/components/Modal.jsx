import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"

export default function Modal({ title, onClose, children }) {
  const panel = useRef(null)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    panel.current?.focus()

    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

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
