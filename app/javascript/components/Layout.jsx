import React from "react"
import { usePage } from "@inertiajs/react"
import SiteHeader from "./SiteHeader"

// Every page except the full-bleed map renders inside this.
export default function Layout({ children }) {
  const { flash } = usePage().props

  return (
    <>
      <SiteHeader />

      {flash?.alert && <div className="flash flash--alert flash--page">{flash.alert}</div>}
      {flash?.notice && <div className="flash flash--notice flash--page">{flash.notice}</div>}

      {children}
    </>
  )
}
