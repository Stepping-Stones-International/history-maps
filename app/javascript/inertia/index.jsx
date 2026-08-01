import React from "react"
import { createRoot } from "react-dom/client"
import { createInertiaApp } from "@inertiajs/react"
import Toasts from "../components/Toasts"
import report from "../lib/report"

// TEMPORARY: surface anything that dies silently in the browser.
window.addEventListener("error", (event) => {
  report("window.error", { message: String(event.message), source: `${event.filename}:${event.lineno}` })
})
window.addEventListener("unhandledrejection", (event) => {
  report("window.rejection", { reason: String(event.reason) })
})

import TopicsIndex from "../pages/Topics/Index"
import TopicsEdit from "../pages/Topics/Edit"
import SessionsNew from "../pages/Sessions/New"
import RegistrationsNew from "../pages/Registrations/New"
import PasswordsNew from "../pages/Passwords/New"
import PasswordsEdit from "../pages/Passwords/Edit"

// Statically mapped so esbuild bundles every page; the app is small enough
// that code splitting would not earn its complexity yet.
const pages = {
  "Topics/Index": TopicsIndex,
  "Topics/Edit": TopicsEdit,
  "Sessions/New": SessionsNew,
  "Registrations/New": RegistrationsNew,
  "Passwords/New": PasswordsNew,
  "Passwords/Edit": PasswordsEdit
}

createInertiaApp({
  resolve: (name) => {
    const page = pages[name]
    if (!page) throw new Error(`Unknown Inertia page: ${name}`)
    return page
  },
  setup({ el, App, props }) {
    // Rendered through App's children so Toasts sits inside the page context
    // and appears on every page, including the layout-less map.
    createRoot(el).render(
      <App {...props}>
        {({ Component, props: pageProps, key }) => (
          <>
            <Component key={key} {...pageProps} />
            <Toasts />
          </>
        )}
      </App>
    )
  }
}).catch((error) => {
  // A failed boot leaves a blank page, so make the cause visible.
  console.error("Inertia boot failed", error)
})
