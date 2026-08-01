// Where a layer's label sits: the centroid of its outline.
//
// Uses the standard polygon centroid, which lands inside the shape for the
// convex outlines this draws. A ring with no area — every point on one line,
// or all the same point — has no centroid, so the average of the points is
// used instead.
export default function areaCentroid(ring) {
  if (!Array.isArray(ring) || ring.length === 0) return null

  let twiceArea = 0
  let x = 0
  let y = 0

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ x0, y0 ] = ring[j]
    const [ x1, y1 ] = ring[i]
    const cross = x0 * y1 - x1 * y0

    twiceArea += cross
    x += (x0 + x1) * cross
    y += (y0 + y1) * cross
  }

  if (Math.abs(twiceArea) < 1e-12) {
    const average = (index) => ring.reduce((sum, point) => sum + point[index], 0) / ring.length
    return [ average(0), average(1) ]
  }

  const scale = 1 / (3 * twiceArea)
  return [ x * scale, y * scale ]
}
