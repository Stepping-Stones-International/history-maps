import React, { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { MapPin } from "lucide-react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"
import TimelineBar from "../../maps/TimelineBar"
import NewNodeForm from "../../maps/NewNodeForm"
import Modal from "../../components/Modal"

const EMPTY_DRAFT = {
  date_type: "exact",
  occurred_month: "",
  occurred_day: "",
  occurred_year: "",
  title: "",
  description: "",
  latitude: "",
  longitude: ""
}

// Full-bleed map with its own drawer, so it renders without Layout.
export default function Edit({ topic, nodes, dateTypes }) {
  // Owned here so the drawer, button and timeline stay in step.
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [composing, setComposing] = useState(false)
  // Held here rather than in the form so it survives the modal being hidden.
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [picking, setPicking] = useState(false)

  const close = () => {
    setComposing(false)
    setPicking(false)
    setDraft(EMPTY_DRAFT)
  }

  const takeCoordinates = ({ latitude, longitude }) => {
    if (!picking) return

    // Six decimals is roughly 10cm — far beyond what a click can mean.
    setDraft((current) => ({
      ...current,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6)
    }))
    setPicking(false)
  }

  const save = () => {
    router.post(`/topics/${topic.id}/nodes`, draft, { onSuccess: close })
  }

  return (
    <>
      <Head title={topic.title} />

      <HomeMap nodes={nodes} placing={picking} onMapClick={takeCoordinates} />
      <Drawer title={topic.title} open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className={`map-actions ${drawerOpen ? "map-actions--inset" : ""}`}>
        <button
          type="button"
          className="button map-actions__button"
          onClick={() => { setDraft(EMPTY_DRAFT); setComposing(true) }}
        >
          <MapPin className="button__glyph" aria-hidden="true" />
          New Node
        </button>

        {picking && (
          <div className="placing-hint" role="status">
            Click the map to set the coordinates
            <button type="button" className="button button--quiet" onClick={() => setPicking(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <TimelineBar drawerOpen={drawerOpen} />

      {/* Hidden, not unmounted, while picking: the draft stays put. */}
      {composing && !picking && (
        <Modal title="New node" onClose={close}>
          <NewNodeForm
            draft={draft}
            dateTypes={dateTypes}
            onChange={setDraft}
            onPickOnMap={() => setPicking(true)}
            onCancel={close}
            onSubmit={save}
          />
        </Modal>
      )}
    </>
  )
}
