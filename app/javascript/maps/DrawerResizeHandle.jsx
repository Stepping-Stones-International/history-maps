import React from "react"

const MIN_WIDTH = 320
const MAX_WIDTH = 620

export default function DrawerResizeHandle({ width, onWidthChange }) {
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
      document.body.classList.remove("is-resizing-drawer")
    }

    document.body.classList.add("is-resizing-drawer")
    document.addEventListener("pointermove", resize)
    document.addEventListener("pointerup", stop)
  }

  return (
    <button
      type="button"
      className="drawer-resize"
      onPointerDown={startResize}
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
    />
  )
}
