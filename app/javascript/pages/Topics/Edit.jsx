import React, { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { MapPin } from "lucide-react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"
import TimelineBar from "../../maps/TimelineBar"
import NewNodeForm from "../../maps/NewNodeForm"
import Modal from "../../components/Modal"

// Full-bleed map with its own drawer, so it renders without Layout.
export default function Edit({ topic, nodes }) {
  // Owned here so the drawer, button and timeline stay in step.
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [composing, setComposing] = useState(false)
  // Details captured from the modal, waiting for a map click to give them a place.
  const [pending, setPending] = useState(null)

  const placeNode = ({ latitude, longitude }) => {
    if (!pending) return

    router.post(`/topics/${topic.id}/nodes`, { ...pending, latitude, longitude }, {
      onFinish: () => setPending(null)
    })
  }

  return (
    <>
      <Head title={topic.title} />

      <HomeMap nodes={nodes} placing={!!pending} onMapClick={placeNode} />
      <Drawer title={topic.title} open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className={`map-actions ${drawerOpen ? "map-actions--inset" : ""}`}>
        <button type="button" className="button map-actions__button" onClick={() => setComposing(true)}>
          <MapPin className="button__glyph" aria-hidden="true" />
          New Node
        </button>

        {pending && (
          <div className="placing-hint" role="status">
            Click the map to place “{pending.title}”
            <button type="button" className="button button--quiet" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <TimelineBar drawerOpen={drawerOpen} />

      {composing && (
        <Modal title="New node" onClose={() => setComposing(false)}>
          <NewNodeForm
            onCancel={() => setComposing(false)}
            onReady={(details) => {
              setPending(details)
              setComposing(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}
