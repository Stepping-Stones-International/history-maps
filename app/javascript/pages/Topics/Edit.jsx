import React, { useState } from "react"
import { Head, router } from "@inertiajs/react"
import { MapPin, Settings } from "lucide-react"
import HomeMap from "../../maps/HomeMap"
import Drawer from "../../maps/Drawer"
import TimelineBar from "../../maps/TimelineBar"
import NodeForm from "../../maps/NodeForm"
import NodeList from "../../maps/NodeList"
import TopicSettingsForm from "../../maps/TopicSettingsForm"
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
  // Which node is called out on the map; clicking its row again clears it.
  const [highlightedId, setHighlightedId] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

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

  // Markers hand back an id, since the node they captured may be stale.
  const startEditingById = (id) => {
    const node = nodes.find((candidate) => candidate.id === id)
    if (node) startEditing(node)
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

  // Called on the router, not through a detached reference: router.patch binds
  // this, so pulling it into a variable throws when it reaches this.visit.
  const save = () => {
    if (editor.mode === "edit") {
      router.patch(`/topics/${topic.id}/nodes/${editor.id}`, draft, { onSuccess: close })
    } else {
      router.post(`/topics/${topic.id}/nodes`, draft, { onSuccess: close })
    }
  }

  return (
    <>
      <Head title={topic.title} />

      <HomeMap
        nodes={nodes}
        placing={picking}
        highlightedId={highlightedId}
        onMapClick={takeCoordinates}
        onNodeSelect={startEditingById}
      />

      <Drawer title={topic.title} open={drawerOpen} onOpenChange={setDrawerOpen}>
        <NodeList
          nodes={nodes}
          highlightedId={highlightedId}
          onHighlight={(node) => setHighlightedId((current) => (current === node.id ? null : node.id))}
          onEdit={startEditing}
        />
      </Drawer>

      <div className={`map-actions ${drawerOpen ? "map-actions--inset" : ""}`}>
        <button
          type="button"
          className="icon-button map-actions__settings"
          onClick={() => setSettingsOpen(true)}
          aria-label="Topic settings"
          title="Topic settings"
        >
          <Settings className="icon-button__glyph" />
        </button>

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

      <TimelineBar nodes={nodes} drawerOpen={drawerOpen} />

      {settingsOpen && (
        <Modal
          title="Topic settings"
          className={`modal--map ${drawerOpen ? "modal--map-inset" : ""}`}
          onClose={() => setSettingsOpen(false)}
        >
          <TopicSettingsForm
            topic={topic}
            onDone={() => setSettingsOpen(false)}
            onCancel={() => setSettingsOpen(false)}
          />
        </Modal>
      )}

      {/* Hidden, not unmounted, while picking: the draft stays put. */}
      {editor && !picking && (
        <Modal
          title={editor.mode === "edit" ? "Edit node" : "New node"}
          className={`modal--map ${drawerOpen ? "modal--map-inset" : ""}`}
          onClose={close}
        >
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
