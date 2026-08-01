import React, { useState } from "react"
import { Head } from "@inertiajs/react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"
import TimelineBar from "../../maps/TimelineBar"

// Full-bleed map with its own drawer, so it renders without Layout.
export default function Edit({ topic }) {
  // Owned here so the drawer and the timeline stay in step.
  const [drawerOpen, setDrawerOpen] = useState(true)

  return (
    <>
      <Head title={topic.title} />
      <HomeMap />
      <Drawer title={topic.title} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <TimelineBar drawerOpen={drawerOpen} />
    </>
  )
}
