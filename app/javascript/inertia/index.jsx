import React from "react"
import { createRoot } from "react-dom/client"
import { createInertiaApp } from "@inertiajs/react"

import TopicsIndex from "../pages/Topics/Index"
import TopicsNew from "../pages/Topics/New"
import TopicsEdit from "../pages/Topics/Edit"
import SessionsNew from "../pages/Sessions/New"
import RegistrationsNew from "../pages/Registrations/New"
import PasswordsNew from "../pages/Passwords/New"
import PasswordsEdit from "../pages/Passwords/Edit"

// Statically mapped so esbuild bundles every page; the app is small enough
// that code splitting would not earn its complexity yet.
const pages = {
  "Topics/Index": TopicsIndex,
  "Topics/New": TopicsNew,
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
    createRoot(el).render(<App {...props} />)
  }
}).catch((error) => {
  // A failed boot leaves a blank page, so make the cause visible.
  console.error("Inertia boot failed", error)
})
