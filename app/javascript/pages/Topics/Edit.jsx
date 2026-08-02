import React, { useRef, useState } from "react"
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
  layer: false,
  area_json: "",
  parent_id: "",
  position: "",
  date_type: "exact",
  starts_type: "exact", starts_month: "", starts_day: "", starts_year: "", starts_era: "AD",
  ends_type: "exact", ends_month: "", ends_day: "", ends_year: "", ends_era: "AD",
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
  layer: Boolean(node.layer),
  area_json: node.area_json || "",
  parent_id: node.parent_id || "",
  position: node.position ?? "",
  date_type: node.date_type,
  starts_type: node.starts_type || "exact",
  starts_month: node.starts_month || "",
  starts_day: node.starts_day || "",
  starts_year: node.starts_year || "",
  starts_era: node.starts_era || "AD",
  ends_type: node.ends_type || "exact",
  ends_month: node.ends_month || "",
  ends_day: node.ends_day || "",
  ends_year: node.ends_year || "",
  ends_era: node.ends_era || "AD",
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
export default function Edit({ topic, nodes, dateTypes, rangeTypes, eras }) {
  // Owned here so the drawer, button and timeline stay in step.
  const [drawerOpen, setDrawerOpen] = useState(true)
  // null when closed, otherwise { mode: "new" } or { mode: "edit", id }.
  const [editor, setEditor] = useState(null)
  // Held here rather than in the form so it survives the modal being hidden.
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [picking, setPicking] = useState(false)
  // Which node is called out on the map; clicking its row or plot again clears it.
  const [highlightedId, setHighlightedId] = useState(null)
  const toggleHighlight = (node) =>
    setHighlightedId((current) => (current === node.id ? null : node.id))
  // null when closed, otherwise the topic draft being edited.
  const [settings, setSettings] = useState(null)
  const [capturingView, setCapturingView] = useState(false)
  // Filled in by the map so the current centre and zoom can be read on demand.
  const viewReader = useRef(null)

  const openSettings = () => setSettings({
    title: topic.title,
    description: topic.description || "",
    center_latitude: topic.default_view?.latitude ?? "",
    center_longitude: topic.default_view?.longitude ?? "",
    zoom: topic.default_view?.zoom ?? ""
  })

  const closeSettings = () => {
    setSettings(null)
    setCapturingView(false)
  }

  const takeCurrentView = () => {
    const view = viewReader.current?.()
    if (view) {
      setSettings((current) => ({
        ...current,
        center_latitude: view.latitude,
        center_longitude: view.longitude,
        zoom: view.zoom
      }))
    }
    setCapturingView(false)
  }

  const saveSettings = () => {
    router.patch(`/topics/${topic.id}`, settings, { onSuccess: closeSettings })
  }

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

  // A node cannot be embedded under itself or under something it already
  // contains, so those are left out of the choices.
  const parentChoices = (() => {
    if (editor?.mode !== "edit") return nodes

    const excluded = new Set([ editor.id ])
    let grew = true
    while (grew) {
      grew = false
      nodes.forEach((node) => {
        if (node.parent_id && excluded.has(node.parent_id) && !excluded.has(node.id)) {
          excluded.add(node.id)
          grew = true
        }
      })
    }

    return nodes.filter((node) => !excluded.has(node.id))
  })()

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
        defaultView={topic.default_view}
        viewReader={viewReader}
        onMapClick={takeCoordinates}
        onNodeSelect={startEditingById}
      />

      <Drawer title={topic.title} open={drawerOpen} onOpenChange={setDrawerOpen}>
        <NodeList
          nodes={nodes}
          highlightedId={highlightedId}
          onHighlight={toggleHighlight}
          onEdit={startEditing}
        />
      </Drawer>

      <div className={`map-actions ${drawerOpen ? "map-actions--inset" : ""}`}>
        <button
          type="button"
          className="icon-button map-actions__settings"
          onClick={openSettings}
          aria-label="Topic settings"
          title="Topic settings"
        >
          <Settings className="icon-button__glyph" />
        </button>

        <button type="button" className="button map-actions__button" onClick={startNew}>
          <MapPin className="button__glyph" aria-hidden="true" />
          New Node / Layer
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

      <TimelineBar
        nodes={nodes}
        drawerOpen={drawerOpen}
        highlightedId={highlightedId}
        onHighlight={toggleHighlight}
      />

      {/* Hidden, not unmounted, while the map is being positioned. */}
      {settings && !capturingView && (
        <Modal
          title="Topic settings"
          className={`modal--map ${drawerOpen ? "modal--map-inset" : ""}`}
          onClose={closeSettings}
        >
          <TopicSettingsForm
            draft={settings}
            onChange={setSettings}
            onSetView={() => setCapturingView(true)}
            onCancel={closeSettings}
            onSubmit={saveSettings}
          />
        </Modal>
      )}

      {capturingView && (
        <div className={`view-capture ${drawerOpen ? "view-capture--inset" : ""}`} role="status">
          <span className="view-capture__hint">Move and zoom the map, then</span>
          <button type="button" className="button" onClick={takeCurrentView}>
            Set map location and zoom
          </button>
          <button type="button" className="button button--text" onClick={() => setCapturingView(false)}>
            Cancel
          </button>
        </div>
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
            rangeTypes={rangeTypes}
            eras={eras}
            parentOptions={parentChoices}
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
