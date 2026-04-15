/*
 * CityscapeScene — Flavorwave / Indeed Brewing style isometric cityscape.
 * Uses REAL isometric math projected to SVG polygons.
 * Standard isometric projection:
 *   screenX = (worldX - worldY) * cos(30°) * S
 *   screenY = (worldX + worldY) * sin(30°) * S - worldZ * S
 * Three visible faces per building: front (low-Y), right (high-X), top (high-Z).
 * Painter's algorithm: sort ascending by (x + y) so front buildings draw last.
 */

const S = 1.5 // pixels per world unit

function iso(wx, wy, wz) {
  return [
    (wx - wy) * 0.866 * S,
    (wx + wy) * 0.5  * S - wz * S,
  ]
}

// Buildings: [x, y, w, d, h, color]
// x/y = grid position, w/d = footprint, h = height (all world units)
// Spaced loosely — ~6 per band, 4 bands = ~24 buildings total
const BUILDINGS = [
  // --- band 0 (back) ---
  [0,   0, 72, 52, 215, '#e8b820'],
  [145, 0, 56, 50, 320, '#12b4c8'],
  [275, 0, 82, 55, 155, '#f0186e'],
  [430, 0, 62, 52, 295, '#6ed46a'],
  [570, 0, 78, 55, 175, '#3a8fcc'],
  [720, 0, 58, 50, 260, '#e83828'],
  // --- band 1 ---
  [18,  90, 62, 52, 180, '#3a8fcc'],
  [155, 90, 80, 55, 330, '#e83828'],
  [310, 90, 58, 50, 120, '#e8b820'],
  [450, 90, 74, 55, 290, '#f0186e'],
  [598, 90, 66, 52, 210, '#12b4c8'],
  [740, 90, 52, 50, 245, '#6ed46a'],
  // --- band 2 ---
  [8,   180, 68, 54, 300, '#f0186e'],
  [150, 180, 58, 52, 150, '#6ed46a'],
  [275, 180, 76, 55, 235, '#3a8fcc'],
  [430, 180, 54, 50, 185, '#e8b820'],
  [565, 180, 80, 55, 325, '#e83828'],
  [720, 180, 58, 52, 165, '#12b4c8'],
  // --- band 3 (front) ---
  [15,  265, 65, 52, 255, '#e8b820'],
  [160, 265, 76, 55, 145, '#f0186e'],
  [308, 265, 55, 52, 310, '#3a8fcc'],
  [445, 265, 70, 54, 180, '#e83828'],
  [592, 265, 60, 52, 270, '#12b4c8'],
  [730, 265, 68, 52, 200, '#6ed46a'],
]

// Painter's algorithm: ascending (x+y) means back→front draw order
const SORTED = [...BUILDINGS].sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]))

function Building({ data }) {
  const [x, y, w, d, h, color] = data
  const p = (pt) => pt.join(',')

  // ── Project all needed corners ──────────────────────────────
  // "back" corners (at low-y = far from viewer in iso)
  const flt = iso(x,   y,   h)   // back-left top
  const frt = iso(x+w, y,   h)   // back-right top
  const fr  = iso(x+w, y,   0)   // back-right base
  // "front" corners (at y+d = near the viewer in iso)
  const bl  = iso(x,   y+d, 0)   // front-left base
  const br  = iso(x+w, y+d, 0)   // front-right base
  const blt = iso(x,   y+d, h)   // front-left top
  const brt = iso(x+w, y+d, h)   // front-right top

  // Visible faces for this iso viewpoint (viewer at large +x, +y, +z):
  //   left  = face at y+d (prominent left side on screen) — medium bright
  //   right = face at x+w (right side on screen)         — darkest
  //   top   = face at z=h                                — brightest
  const left  = [p(bl), p(br), p(brt), p(blt)].join(' ')
  const right = [p(fr), p(br), p(brt), p(frt)].join(' ')
  const top   = [p(flt), p(frt), p(brt), p(blt)].join(' ')

  return (
    <g>
      {/* Left face — medium brightness */}
      <polygon points={left}  fill={color} filter="url(#dim)" />
      {/* Right face — darkest */}
      <polygon points={right} fill={color} filter="url(#dark)" />
      {/* Top face — brightest */}
      <polygon points={top}   fill={color} filter="url(#bright)" />
      {/* Hairline outlines */}
      <polygon points={left}  fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
      <polygon points={right} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
      <polygon points={top}   fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
    </g>
  )
}

export default function CityscapeScene() {
  // World: x 0→800, y 0→320 (265+d≈320), z 0→330
  // screenX range: iso(0,320,0)[0]≈-415  →  iso(800,0,0)[0]≈1040
  // screenY range: iso(0,0,330)[1]≈-495  →  iso(800,320,0)[1]≈840
  const VX = -440, VY = -540, VW = 1540, VH = 1440

  return (
    <svg
      className="cityscape-svg"
      viewBox={`${VX} ${VY} ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Front face: 82% brightness */}
        <filter id="dim" x="0" y="0" width="1" height="1">
          <feColorMatrix type="matrix" values="
            0.82 0 0 0 0
            0 0.82 0 0 0
            0 0 0.82 0 0
            0 0 0 1 0
          " />
        </filter>
        {/* Right face: 58% brightness */}
        <filter id="dark" x="0" y="0" width="1" height="1">
          <feColorMatrix type="matrix" values="
            0.58 0 0 0 0
            0 0.58 0 0 0
            0 0 0.58 0 0
            0 0 0 1 0
          " />
        </filter>
        {/* Top face: 115% brightness */}
        <filter id="bright" x="0" y="0" width="1" height="1">
          <feColorMatrix type="matrix" values="
            1.15 0 0 0 0.05
            0 1.15 0 0 0.05
            0 0 1.15 0 0.05
            0 0 0 1 0
          " />
        </filter>
      </defs>

      {SORTED.map((b, i) => (
        <Building key={i} data={b} />
      ))}
    </svg>
  )
}
