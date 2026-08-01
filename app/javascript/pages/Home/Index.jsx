import React from "react"
import { Head } from "@inertiajs/react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"

// The map is full-bleed and has its own drawer, so it renders without Layout.
export default function Index() {
  return (
    <>
      <Head title="Christian History Maps" />
      <HomeMap />
      <Drawer />
    </>
  )
}
