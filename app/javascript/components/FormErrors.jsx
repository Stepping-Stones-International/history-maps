import React from "react"

export default function FormErrors({ errors }) {
  const messages = Object.values(errors || {}).flat()
  if (messages.length === 0) return null

  return (
    <div className="flash flash--alert">
      <ul className="flash__list">
        {messages.map((message) => <li key={message}>{message}</li>)}
      </ul>
    </div>
  )
}
