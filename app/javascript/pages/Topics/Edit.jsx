import React, { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { MapPin } from "lucide-react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"
import TimelineBar from "../../maps/TimelineBar"
import NodeForm from "../../maps/NodeForm"
import NodeList from "../../maps/NodeList"
import Modal from "../../components/Modal"

const EMPTY_DRAFT = {
  date_type: "exact",
  occurred_month: "",
  occurred_day: "",
  occurred_year: "",
  era: "AD",
  title: "",
  description: "",
  latitude: "",
  longitude: ""
}

// Only the fields the form edits; id and display-only values are left behind.
const draftFrom = (node) => ({
  date_type: node.date_type,
  occurred_month: node.occurred_month,
  occurred_day: node.occurred_day,
  occurred_year: node.occurred_year,
  era: node.era,
  title: node.title,
  description: node.description || "",
  latitude: node.latitude,
  longitude: node.longitude
})

// Full-bleed map with its own drawer, so it renders without Layout.
export default function Edit({ topic, nodes, dateTypes, eras }) {
  // Owned here so the drawer, button and timeline stay in step.
  const [drawerOpen, setDrawerOpen] = useState(true)
  // null when closed, otherwise { mode: "new" } or { mode: "edit", id }.
  const [editor, setEditor] = useState(null)
  // Held here rather than in the form so it survives the modal being hidden.
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [picking, setPicking] = useState(false)

  const close = () => {
    setEditor(null)
    setPicking(false)
    setDraft(EMPTY_DRAFT)
  }

  const startNew = () => {
    setDraft(EMPTY_DRAFT)
    setEditor({ mode: "new" })
  }

  const startEditing = (node) => {
    setDraft(draftFrom(node))
    setEditor({ mode: "edit", id: node.id })
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
    const url = editor.mode === "edit"
      ? `/topics/${topic.id}/nodes/${editor.id}`
      : `/topics/${topic.id}/nodes`

    const send = editor.mode === "edit" ? router.patch : router.post
    send(url, draft, { onSuccess: close })
  }

  return (
    <>
      <Head title={topic.title} />

      <HomeMap nodes={nodes} placing={picking} onMapClick={takeCoordinates} />

      <Drawer title={topic.title} open={drawerOpen} onOpenChange={setDrawerOpen}>
        <NodeList nodes={nodes} onSelect={startEditing} />
      </Drawer>

      <div className={`map-actions ${drawerOpen ? "map-actions--inset" : ""}`}>
        <button type="button" className="button map-actions__button" onClick={startNew}>
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
      {editor && !picking && (
        <Modal title={editor.mode === "edit" ? "Edit node" : "New node"} onClose={close}>
          <NodeForm
            draft={draft}
            dateTypes={dateTypes}
            eras={eras}
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
