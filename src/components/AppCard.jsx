/*
 * AppCard — each app hung as a framed painting on a gallery wall.
 * 4 SVG frame styles:
 *   baroque  — heavy gold rococo with corner rosette ornaments
 *   walnut   — dark walnut wood grain with ebonized liner
 *   silver   — thin reeded neoclassical platinum
 *   ebony    — black lacquer with triple gold fillet lines + mitre corner diamonds
 *
 * SVG viewBox: 0 0 420 268 — painting window: (32,30)→(388,238) = 356×208 units
 */

const W = 420, H = 268

// Compound path helper: outer rect minus inner rect (even-odd punches the hole for painting)
function ring(x1, y1, x2, y2, ix1, iy1, ix2, iy2) {
  return `M${x1},${y1} H${x2} V${y2} H${x1} Z M${ix1},${iy1} H${ix2} V${iy2} H${ix1} Z`
}

// Shared SVG style for all frame overlays
const frameSvgStyle = {
  position: 'absolute', inset: 0,
  width: '100%', height: '100%',
  pointerEvents: 'none', display: 'block',
  overflow: 'visible',
}

// ── Baroque: heavy gold rococo ────────────────────────
function BaroqueFrame({ id }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={frameSvgStyle}>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4a3008" />
          <stop offset="18%"  stopColor="#c9a84c" />
          <stop offset="35%"  stopColor="#7a5818" />
          <stop offset="52%"  stopColor="#e0c060" />
          <stop offset="68%"  stopColor="#8b6e24" />
          <stop offset="84%"  stopColor="#c0962c" />
          <stop offset="100%" stopColor="#4a3008" />
        </linearGradient>
        <linearGradient id={`bm-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#9a7a20" />
          <stop offset="40%"  stopColor="#ecd878" />
          <stop offset="100%" stopColor="#7a6018" />
        </linearGradient>
        <linearGradient id={`bi-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2c1e04" />
          <stop offset="50%"  stopColor="#5a3e10" />
          <stop offset="100%" stopColor="#1e1402" />
        </linearGradient>
      </defs>

      {/* Outer drop shadow */}
      <path fillRule="evenodd" fill="rgba(0,0,0,0.6)"
        d={ring(0,0, W,H, 3,3, W-3,H-3)} />
      {/* Wide outer gold step */}
      <path fillRule="evenodd" fill={`url(#bg-${id})`}
        d={ring(3,3, W-3,H-3, 10,10, W-10,H-10)} />
      {/* Raised center gold band */}
      <path fillRule="evenodd" fill={`url(#bm-${id})`}
        d={ring(10,10, W-10,H-10, 20,18, W-20,H-18)} />
      {/* Carved cove / hollow */}
      <path fillRule="evenodd" fill={`url(#bi-${id})`}
        d={ring(20,18, W-20,H-18, 26,24, W-26,H-24)} />
      {/* Inner gold fillet */}
      <path fillRule="evenodd" fill={`url(#bm-${id})`}
        d={ring(26,24, W-26,H-24, 29,27, W-29,H-27)} />
      {/* Dark mat */}
      <path fillRule="evenodd" fill="#16110a"
        d={ring(29,27, W-29,H-27, 32,30, W-32,H-30)} />

      {/* Engraved groove lines */}
      <rect x="10" y="10" width={W-20} height={H-20} fill="none"
        stroke="rgba(255,240,140,0.18)" strokeWidth="1" />
      <rect x="20" y="18" width={W-40} height={H-36} fill="none"
        stroke="rgba(0,0,0,0.45)" strokeWidth="1" />

      {/* Corner rosette ornaments */}
      {[[16,14],[W-16,14],[16,H-14],[W-16,H-14]].map(([cx,cy], i) => (
        <g key={i}>
          {/* Petal lobes */}
          {[0,90,180,270].map(deg => {
            const rad = deg * Math.PI / 180
            const ox = cx + Math.cos(rad) * 7
            const oy = cy + Math.sin(rad) * 7
            return (
              <ellipse key={deg} cx={ox} cy={oy} rx="4" ry="2.2"
                transform={`rotate(${deg},${ox},${oy})`}
                fill={`url(#bm-${id})`} />
            )
          })}
          {/* Diagonal lobes */}
          {[45,135,225,315].map(deg => {
            const rad = deg * Math.PI / 180
            const ox = cx + Math.cos(rad) * 6.5
            const oy = cy + Math.sin(rad) * 6.5
            return (
              <ellipse key={deg} cx={ox} cy={oy} rx="2.5" ry="1.5"
                transform={`rotate(${deg},${ox},${oy})`}
                fill={`url(#bg-${id})`} opacity="0.8" />
            )
          })}
          {/* Center disc */}
          <circle cx={cx} cy={cy} r="5.5" fill={`url(#bm-${id})`} stroke="#5a3e10" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="3"   fill="#8b6018" />
          <circle cx={cx} cy={cy} r="1.2" fill={`url(#bm-${id})`} />
        </g>
      ))}
    </svg>
  )
}

// ── Walnut: dark wood with ebonized liner ─────────────
function WalnutFrame({ id }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={frameSvgStyle}>
      <defs>
        <linearGradient id={`wo-${id}`} x1="0%" y1="0%" x2="8%" y2="100%">
          <stop offset="0%"   stopColor="#4a3020" />
          <stop offset="22%"  stopColor="#6a4a2e" />
          <stop offset="45%"  stopColor="#3a2416" />
          <stop offset="68%"  stopColor="#5e3e28" />
          <stop offset="100%" stopColor="#321c0e" />
        </linearGradient>
        <linearGradient id={`whl-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(160,110,60,0.6)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id={`wsh-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </linearGradient>
        <pattern id={`wgr-${id}`} x="0" y="0" width="9" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="1.5" x2="9" y2="1.5" stroke="rgba(0,0,0,0.1)" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* Outer shadow */}
      <path fillRule="evenodd" fill="rgba(0,0,0,0.65)"
        d={ring(0,0, W,H, 3,3, W-3,H-3)} />
      {/* Outer wood step */}
      <path fillRule="evenodd" fill={`url(#wo-${id})`}
        d={ring(3,3, W-3,H-3, 11,11, W-11,H-11)} />
      {/* Wood grain texture */}
      <path fillRule="evenodd" fill={`url(#wgr-${id})`} opacity="0.6"
        d={ring(3,3, W-3,H-3, 11,11, W-11,H-11)} />
      {/* Left/top bevel highlight */}
      <path d={`M3,${H-3} L3,3 H${W-3}`} fill="none"
        stroke="rgba(140,90,45,0.5)" strokeWidth="2.5" />
      {/* Right/bottom bevel shadow */}
      <path d={`M${W-3},3 V${H-3} H3`} fill="none"
        stroke="rgba(0,0,0,0.55)" strokeWidth="2.5" />
      {/* Inner step */}
      <path fillRule="evenodd" fill={`url(#wo-${id})`}
        d={ring(11,11, W-11,H-11, 22,20, W-22,H-20)} />
      <path d={`M11,${H-11} L11,11 H${W-11}`} fill="none"
        stroke="rgba(180,120,60,0.3)" strokeWidth="1" />
      {/* Ebonized liner */}
      <path fillRule="evenodd" fill="#090706"
        d={ring(22,20, W-22,H-20, 32,30, W-32,H-30)} />
      {/* Gold liner inner edge glow */}
      <rect x="22" y="20" width={W-44} height={H-40} fill="none"
        stroke="rgba(180,130,50,0.45)" strokeWidth="1" />
      <rect x="31" y="29" width={W-62} height={H-58} fill="none"
        stroke="rgba(180,130,50,0.2)" strokeWidth="0.5" />

      {/* Corner block notches */}
      {[[3,3],[W-3,3],[3,H-3],[W-3,H-3]].map(([cx,cy], i) => (
        <rect key={i} x={cx < W/2 ? cx : cx-10} y={cy < H/2 ? cy : cy-10}
          width="10" height="10"
          fill={`url(#wo-${id})`} stroke="rgba(0,0,0,0.5)" strokeWidth="0.8" />
      ))}
    </svg>
  )
}

// ── Silver: thin reeded neoclassical ─────────────────
function SilverFrame({ id }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={frameSvgStyle}>
      <defs>
        <linearGradient id={`so-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#484848" />
          <stop offset="18%"  stopColor="#d0d0d0" />
          <stop offset="36%"  stopColor="#686868" />
          <stop offset="54%"  stopColor="#e0e0e0" />
          <stop offset="72%"  stopColor="#808080" />
          <stop offset="100%" stopColor="#383838" />
        </linearGradient>
        <linearGradient id={`sm-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#c0c0c0" />
          <stop offset="50%"  stopColor="#606060" />
          <stop offset="100%" stopColor="#c0c0c0" />
        </linearGradient>
      </defs>

      {/* Outer shadow */}
      <path fillRule="evenodd" fill="rgba(0,0,0,0.5)"
        d={ring(0,0, W,H, 2,2, W-2,H-2)} />
      {/* Outer flat silver */}
      <path fillRule="evenodd" fill={`url(#so-${id})`}
        d={ring(2,2, W-2,H-2, 8,8, W-8,H-8)} />
      {/* Reeded channel lines — vertical sides */}
      {[9,12,15,18,21, W-21,W-18,W-15,W-12,W-9].map((x,i) => (
        <line key={`rv${i}`} x1={x} y1="2" x2={x} y2={H-2}
          stroke="rgba(60,60,60,0.35)" strokeWidth="0.7" />
      ))}
      {[9,12,15,18,21, H-21,H-18,H-15,H-12,H-9].map((y,i) => (
        <line key={`rh${i}`} x1="2" y1={y} x2={W-2} y2={y}
          stroke="rgba(60,60,60,0.35)" strokeWidth="0.7" />
      ))}
      {/* Step transition */}
      <path fillRule="evenodd" fill={`url(#sm-${id})`}
        d={ring(8,8, W-8,H-8, 19,17, W-19,H-17)} />
      {/* Highlight bevel top/left */}
      <path d={`M8,${H-8} L8,8 H${W-8}`} fill="none"
        stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      {/* Shadow bevel bottom/right */}
      <path d={`M${W-8},8 V${H-8} H8`} fill="none"
        stroke="rgba(0,0,0,0.45)" strokeWidth="1.2" />
      {/* Narrow inner silver fillet */}
      <path fillRule="evenodd" fill={`url(#so-${id})`}
        d={ring(19,17, W-19,H-17, 26,24, W-26,H-24)} />
      <rect x="19" y="17" width={W-38} height={H-34} fill="none"
        stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      {/* Mat */}
      <path fillRule="evenodd" fill="#181818"
        d={ring(26,24, W-26,H-24, 32,30, W-32,H-30)} />
    </svg>
  )
}

// ── Ebony: black lacquer + triple gold fillets ────────
function EbonyFrame({ id }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={frameSvgStyle}>
      <defs>
        <linearGradient id={`eo-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1c1c1c" />
          <stop offset="30%"  stopColor="#2c2c2c" />
          <stop offset="60%"  stopColor="#0e0e0e" />
          <stop offset="100%" stopColor="#1e1e1e" />
        </linearGradient>
        <linearGradient id={`eg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#b89030" />
          <stop offset="40%"  stopColor="#e8d878" />
          <stop offset="100%" stopColor="#9a7828" />
        </linearGradient>
      </defs>

      {/* Outer shadow */}
      <path fillRule="evenodd" fill="rgba(0,0,0,0.7)"
        d={ring(0,0, W,H, 3,3, W-3,H-3)} />
      {/* Black lacquer body */}
      <path fillRule="evenodd" fill={`url(#eo-${id})`}
        d={ring(3,3, W-3,H-3, 32,30, W-32,H-30)} />
      {/* Lacquer sheen bevel */}
      <path d={`M3,${H-3} L3,3 H${W-3}`} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      {/* Outer gold fillet */}
      <rect x="6"  y="6"  width={W-12} height={H-12} fill="none"
        stroke={`url(#eg-${id})`} strokeWidth="1.8" />
      {/* Middle gold fillet */}
      <rect x="11" y="11" width={W-22} height={H-22} fill="none"
        stroke={`url(#eg-${id})`} strokeWidth="0.9" opacity="0.6" />
      {/* Intermediate shadow band */}
      <path fillRule="evenodd" fill="rgba(0,0,0,0.25)"
        d={ring(14,14, W-14,H-14, 26,24, W-26,H-24)} />
      {/* Inner gold fillet */}
      <rect x="26" y="24" width={W-52} height={H-48} fill="none"
        stroke={`url(#eg-${id})`} strokeWidth="1.4" />
      {/* Dark mat */}
      <path fillRule="evenodd" fill="#080808"
        d={ring(29,27, W-29,H-27, 32,30, W-32,H-30)} />

      {/* Mitre corner diamonds */}
      {[[14,14],[W-14,14],[14,H-14],[W-14,H-14]].map(([cx,cy], i) => (
        <g key={i}>
          <rect x={cx-8} y={cy-8} width="16" height="16"
            transform={`rotate(45,${cx},${cy})`}
            fill={`url(#eo-${id})`} stroke={`url(#eg-${id})`} strokeWidth="1.2" />
          <rect x={cx-4} y={cy-4} width="8" height="8"
            transform={`rotate(45,${cx},${cy})`}
            fill={`url(#eg-${id})`} opacity="0.55" />
          <circle cx={cx} cy={cy} r="2" fill={`url(#eg-${id})`} />
        </g>
      ))}
    </svg>
  )
}

const FRAMES = {
  baroque: BaroqueFrame,
  walnut:  WalnutFrame,
  silver:  SilverFrame,
  ebony:   EbonyFrame,
}

// ── AppCard ───────────────────────────────────────────
export default function AppCard({ app }) {
  const statusLabel = { live: 'Live', beta: 'Beta', soon: 'Soon' }
  const statusClass  = { live: 'status-live', beta: 'status-beta', soon: 'status-soon' }
  const isExternal   = app.href !== '#'
  const FrameSVG     = FRAMES[app.frameStyle] || FRAMES.baroque
  const uid          = `f${app.id}`

  return (
    <a
      href={app.href}
      className="app-card"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={`Open ${app.title}`}
      style={{ '--card-color': app.color }}
    >
      {/* ── Frame wrapper ── */}
      <div className="frame-wrapper">
        {/* Wire hanger above the frame */}
        <div className="frame-wire" />

        {/* Canvas — fills the painting window area, frame overlays on top */}
        <div className="canvas-window" style={{ '--cv': app.color }}>
          <div className="canvas-bg-glow" />
          <div className="canvas-shape-1" />
          <div className="canvas-shape-2" />
          <div className="canvas-shape-3" />
          <div className="canvas-icon-wrap">
            <span className="app-card-icon" style={{ color: app.color }}>{app.icon}</span>
          </div>
        </div>

        {/* SVG frame overlay */}
        <FrameSVG id={uid} />
      </div>

      {/* ── Plaque ── */}
      <div className="app-card-body">
        <div className="app-card-meta">
          <span className="app-card-category">{app.category}</span>
          <span className={`app-card-status ${statusClass[app.status]}`}>
            {statusLabel[app.status]}
          </span>
        </div>
        <h3 className="app-card-title">{app.title}</h3>
        <p className="app-card-desc">{app.description}</p>
        <div className="app-card-footer">
          <span className="app-card-open">
            {app.status === 'soon' ? 'Coming soon' : 'Open app'}
            {app.status !== 'soon' && (
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        </div>
      </div>
    </a>
  )
}
