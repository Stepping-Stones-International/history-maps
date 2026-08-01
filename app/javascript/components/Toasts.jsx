import React, { useEffect, useRef, useState } from "react"
import { usePage } from "@inertiajs/react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

const DISMISS_AFTER = 4500

export default function Toasts() {
  const { flash } = usePage().props
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  // Inertia sends a fresh props object per response, so this fires once per
  // navigation rather than on every re-render.
  useEffect(() => {
    const incoming = []
    if (flash?.notice) incoming.push({ tone: "notice", text: flash.notice })
    if (flash?.alert) incoming.push({ tone: "alert", text: flash.alert })
    if (incoming.length === 0) return undefined

    const added = incoming.map((toast) => ({ ...toast, id: nextId.current++ }))
    setToasts((current) => [...current, ...added])

    const timers = added.map((toast) => setTimeout(() => dismiss(toast.id), DISMISS_AFTER))
    return () => timers.forEach(clearTimeout)
  }, [flash])

  const dismiss = (id) => setToasts((current) => current.filter((toast) => toast.id !== id))

  if (toasts.length === 0) return null

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(({ id, tone, text }) => {
        const Icon = tone === "alert" ? AlertCircle : CheckCircle2

        return (
          <div key={id} className={`toast toast--${tone}`}>
            <Icon className="toast__icon" aria-hidden="true" />
            <span className="toast__text">{text}</span>
            <button
              type="button"
              className="toast__dismiss"
              onClick={() => dismiss(id)}
              aria-label="Dismiss"
            >
              <X className="toast__dismiss-glyph" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
