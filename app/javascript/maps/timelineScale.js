// Turns dated nodes into positions along the timeline.
//
// A date becomes a single number: the year, negated for BC so it counts
// backwards, plus a fraction for the month and day. Time still runs forwards
// within a BC year, so the fraction is always added.
export function dateValue(node) {
  // Blank must not become year 0: Number("") is 0, which would plot an
  // undated node in the middle of the timeline.
  const raw = node.occurred_year
  if (raw === null || raw === undefined || String(raw).trim() === "") return null

  const year = Number(raw)
  if (!Number.isFinite(year) || year === 0) return null

  const month = Number(node.occurred_month) || 1
  const day = Number(node.occurred_day) || 1
  const fraction = (month - 1) / 12 + (day - 1) / 372

  return node.era === "BC" ? -year + fraction : year + fraction
}

export function datedNodes(nodes) {
  return nodes
    .map((node) => ({ node, value: dateValue(node) }))
    .filter(({ value }) => value !== null)
    .sort((a, b) => a.value - b.value)
}

// Steps that read as round numbers of years.
const STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500]

export function tickStep(span, target = 20) {
  const rough = span / target
  return STEPS.find((step) => step >= rough) || STEPS[STEPS.length - 1]
}

export function buildScale(nodes, { padding = 0.06 } = {}) {
  const dated = datedNodes(nodes)
  if (dated.length < 2) return null

  const first = dated[0].value
  const last = dated[dated.length - 1].value
  const span = last - first

  // Every node shares a date: nothing to space out.
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
    epochs: dated.map(({ node, value }) => ({ node, left: position(value) }))
  }
}
