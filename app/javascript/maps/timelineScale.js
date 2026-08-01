// Turns dated nodes into positions along the timeline.
//
// A date becomes a single number: the year, negated for BC so it counts
// backwards, plus a fraction for the month and day. Time still runs forwards
// within a BC year, so the fraction is always added.
function partsValue(year, month, day, era) {
  // Blank must not become year 0: Number("") is 0, which would plot an
  // undated node in the middle of the timeline.
  if (year === null || year === undefined || String(year).trim() === "") return null

  const value = Number(year)
  if (!Number.isFinite(value) || value === 0) return null

  const m = Number(month) || 1
  const d = Number(day) || 1
  const fraction = (m - 1) / 12 + (d - 1) / 372

  return era === "BC" ? -value + fraction : value + fraction
}

export function dateValue(node) {
  return partsValue(node.occurred_year, node.occurred_month, node.occurred_day, node.era)
}

// A span carries both ends; anything else is a single point, with end null.
export function nodeDates(node) {
  if (node.date_type === "range") {
    const start = partsValue(node.starts_year, node.starts_month, node.starts_day, node.starts_era)
    const end = partsValue(node.ends_year, node.ends_month, node.ends_day, node.ends_era)
    if (start === null || end === null) return null

    return { start, end: Math.max(start, end) }
  }

  const point = dateValue(node)
  return point === null ? null : { start: point, end: null }
}

export function datedNodes(nodes) {
  return nodes
    .map((node) => ({ node, ...(nodeDates(node) || {}) }))
    .filter(({ start }) => start !== undefined && start !== null)
    .sort((a, b) => a.start - b.start)
}

// Steps that read as round numbers of years.
const STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500]

export function tickStep(span, target = 20) {
  const rough = span / target
  return STEPS.find((step) => step >= rough) || STEPS[STEPS.length - 1]
}

export function buildScale(nodes, { padding = 0.06 } = {}) {
  const dated = datedNodes(nodes)

  // Every date on the line, both ends of a span included.
  const values = dated.flatMap(({ start, end }) => (end === null ? [ start ] : [ start, end ]))
  if (values.length < 2) return null

  const first = Math.min(...values)
  const last = Math.max(...values)
  const span = last - first

  // Everything shares one date: nothing to space out.
  if (span === 0) return null

  const pad = span * padding
  const min = first - pad
  const max = last + pad
  const position = (value) => ((value - min) / (max - min)) * 100

  const step = tickStep(span)
  const ticks = []
  for (let year = Math.ceil(min / step) * step; year <= max; year += step) {
    ticks.push({ year, left: position(year) })
  }

  return {
    min,
    max,
    step,
    ticks,
    epochs: dated.map(({ node, start, end }) => ({
      node,
      left: position(start),
      right: end === null ? null : position(end)
    }))
  }
}
