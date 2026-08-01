// Remembers which nodes are expanded in the sidebar. Each entry carries its own
// expiry, so toggling a node keeps it remembered for another 30 days while ones
// left alone eventually fall out.
const KEY = "knowledge:expandedNodes"
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

function load() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) || "{}")
    const now = Date.now()

    return Object.fromEntries(
      Object.entries(stored).filter(([ , expiresAt ]) => Number(expiresAt) > now)
    )
  } catch (_error) {
    // Unreadable or unavailable storage just means nothing is remembered.
    return {}
  }
}

function save(entries) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries))
  } catch (_error) {
    // Storage being full or blocked must not break the sidebar.
  }
}

export function expandedIds() {
  return new Set(Object.keys(load()))
}

export function remember(id, expanded) {
  const entries = load()

  if (expanded) {
    entries[id] = Date.now() + THIRTY_DAYS
  } else {
    delete entries[id]
  }

  save(entries)
}
