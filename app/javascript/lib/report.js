// TEMPORARY: mirrors browser-side events into the Rails log so a save that
// never leaves the browser is still visible. Remove with DiagnosticsController.
export default function report(event, data = {}) {
  const payload = { event, at: new Date().toISOString(), ...data }

  try {
    console.log("[node-save]", event, payload)
    fetch("/diagnostics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {})
  } catch (_error) {
    // Diagnostics must never break the thing being diagnosed.
  }
}
