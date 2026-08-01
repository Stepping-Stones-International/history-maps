import React from "react"
import SiteHeader from "./SiteHeader"

// Every page except the full-bleed map renders inside this. Flash messages are
// not shown here: Toasts renders them globally.
export default function Layout({ children }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
