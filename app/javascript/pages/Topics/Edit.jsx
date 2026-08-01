import React from "react"
import { Head } from "@inertiajs/react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"

// Full-bleed map with its own drawer, so it renders without Layout.
export default function Edit({ topic }) {
  return (
    <>
      <Head title={topic.title} />
      <HomeMap />
      <Drawer>
        <p className="drawer__topic-title">{topic.title}</p>
        {topic.description && <p className="drawer__topic-description">{topic.description}</p>}
      </Drawer>
    </>
  )
}
