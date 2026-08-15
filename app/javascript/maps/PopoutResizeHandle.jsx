import React from "react"

const MIN_WIDTH = 360
const MAX_WIDTH = 720

export default function PopoutResizeHandle({ width = MIN_WIDTH, onWidthChange }) {
  const startResize = (event) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = width

    const resize = (moveEvent) => {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX))
      onWidthChange?.(next)
    }

    const stop = () => {
      document.removeEventListener("pointermove", resize)
      document.removeEventListener("pointerup", stop)
      document.body.classList.remove("is-resizing-popout")
    }

    document.body.classList.add("is-resizing-popout")
    document.addEventListener("pointermove", resize)
    document.addEventListener("pointerup", stop)
  }

  return (
    <button
      type="button"
      className="popout-resize"
      onPointerDown={startResize}
      aria-label="Resize panel"
      title="Resize panel"
    />
  )
}
