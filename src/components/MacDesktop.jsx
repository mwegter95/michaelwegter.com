/*
 * MacDesktop — Classic Macintosh in 3/4 isometric perspective.
 *
 * SVG viewBox: "0 0 680 760"
 * Perspective offset: right +88px, up -34px (right side & top visible)
 * Front face rectangle: (52, 44) → (484, 44) → (484, 692) → (52, 692)   rx=14
 * Right face:  (484, 44) → (572, 10) → (572, 658) → (484, 692)
 * Top face:    (52,  44) → (484, 44) → (572, 10)  → (140, 10)
 * Screen glass: x=100 y=90 w=336 h=254
 *   Menu bar:  y=90–108  (18px)
 *   Desktop:   y=108–316 (208px) — icons live here
 *   Status bar:y=316–344 (28px)  — hover description lives here
 *
 * HTML overlay sits on screen glass (%s of 680×760 viewBox):
 *   left: 100/680 = 14.71%,  top: 90/760 = 11.84%
 *   width: 336/680 = 49.41%, height: 254/760 = 33.42%
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apps } from '../data/apps'

function useClockTime() {
  const fmt = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const tick = () => setTime(fmt())
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ── SVG sub-components ────────────────────────────────────────────────

function MacSVG() {
  return (
    <svg
      viewBox="-28 0 680 760"
      xmlns="http://www.w3.org/2000/svg"
      className="mac-svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Front face gradient — brightest on left, slightly darker right */}
        <linearGradient id="macFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ddd5be" />
          <stop offset="55%"  stopColor="#cdc4ad" />
          <stop offset="100%" stopColor="#bfb89e" />
        </linearGradient>
        {/* Right side face — in shadow */}
        <linearGradient id="macRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#b2ab94" />
          <stop offset="100%" stopColor="#9e9780" />
        </linearGradient>
        {/* Top face — lit from above */}
        <linearGradient id="macTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#dbd3bc" />
          <stop offset="100%" stopColor="#c8c0a8" />
        </linearGradient>
        {/* 3D corner cap — top-right front, blends top→right face */}
        <linearGradient id="macCornerTR" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#b8b09a" />
          <stop offset="100%" stopColor="#cbc3ac" />
        </linearGradient>
        {/* 3D corner cap — bottom-right front */}
        <linearGradient id="macCornerBR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#a8a18c" />
          <stop offset="100%" stopColor="#9e9780" />
        </linearGradient>
        {/* Screen glass sheen — subtle diagonal highlight */}
        <linearGradient id="screenSheen" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.04)" />
          <stop offset="45%"  stopColor="rgba(255,255,255,0.01)" />
          <stop offset="46%"  stopColor="transparent" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        {/* Soft drop shadow filter */}
        <filter id="macShadow" x="-12%" y="-6%" width="130%" height="118%">
          <feDropShadow dx="8" dy="20" stdDeviation="22" floodColor="rgba(0,0,0,0.65)" />
        </filter>
        {/* Bezel inner glow (CRT feel) */}
        <radialGradient id="crtGlow" cx="50%" cy="44%" r="52%">
          <stop offset="0%"   stopColor="rgba(60,130,100,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Vent slot gradient */}
        <linearGradient id="ventSlot" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#9a9380" />
          <stop offset="50%"  stopColor="#6e6858" />
          <stop offset="100%" stopColor="#9a9380" />
        </linearGradient>
      </defs>

      {/* ── Drop shadow ── */}
      <g filter="url(#macShadow)">
        <polygon points="52,44 558,10 572,24 572,644 558,658 484,692 52,692" fill="#2a2620" opacity="0.4" />
      </g>

      {/*
        ── ROUNDED RECTANGULAR PRISM GEOMETRY ──
        Front face: <rect x=52 y=44 w=432 h=648 rx=14>
          Top edge flat segment:   x=66..470  at y=44
          Right edge flat segment: x=484      at y=58..678
          Top-right arc:    center(470,58)  from (470,44)→(484,58)   sweep CW
          Bottom-right arc: center(470,678) from (484,678)→(470,692) sweep CW
        Perspective offset: +88px right, -34px up

        Top face: parallelogram aligned to front top-edge endpoints
          (66,44) → (470,44) → (558,10) → (154,10)
        Right face: parallelogram aligned to front right-edge endpoints
          (484,58) → (572,24) → (572,644) → (484,678)
        Corner caps fill the arc-gap triangles between face edges and the curved corners.
      */}

      {/* ── Top face — starts/ends exactly at front top-edge flat endpoints ── */}
      <polygon
        points="66,44 470,44 558,10 154,10"
        fill="url(#macTop)"
      />
      <line x1="66" y1="44" x2="470" y2="44" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />

      {/* ── Right face — starts/ends exactly at front right-edge flat endpoints ── */}
      <polygon
        points="484,58 572,24 572,644 484,678"
        fill="url(#macRight)"
      />
      <line x1="484" y1="58" x2="484" y2="678" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

      {/* ── Top-right 3D corner cap ──
          Fills the gap between top face (ends at 470,44), right face (starts at 484,58),
          and the front face rx=14 arc. This is how a rounded prism projects in 2D. ── */}
      <path
        d="M 470,44 A 14,14 0 0 1 484,58 L 572,24 L 558,10 Z"
        fill="url(#macCornerTR)"
      />

      {/* ── Bottom-right 3D corner cap ── */}
      <path
        d="M 484,678 A 14,14 0 0 1 470,692 L 558,658 L 572,644 Z"
        fill="url(#macCornerBR)"
      />
      {/* Ventilation slots — right face, middle third */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => {
        const yBase = 340 + i * 18
        // Project slot from right face: x goes from 492 at front to 556 at back
        const x1 = 492, y1 = yBase
        const x2 = 556, y2 = yBase - 14
        const x3 = 556, y3 = yBase - 11
        const x4 = 492, y4 = yBase + 3
        return (
          <polygon key={i}
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
            fill="url(#ventSlot)" opacity="0.7" />
        )
      })}
      {/* Right face logo text */}
      <text
        x="532" y="200"
        textAnchor="middle"
        fontSize="9"
        fontFamily="monospace"
        fill="rgba(120,110,90,0.6)"
        transform="rotate(0, 532, 200)"
        writingMode="tb"
        letterSpacing="2"
      >BUILT BY MW</text>

      {/* ── Front face — main body ── */}
      <rect x="52" y="44" width="432" height="648" rx="14"
        fill="url(#macFront)"
      />

      {/* Subtle molding / shadow along top of front face */}
      <rect x="52" y="44" width="432" height="28" rx="14"
        fill="rgba(0,0,0,0.04)" />
      <rect x="52" y="58" width="432" height="6"
        fill="rgba(255,255,255,0.06)" />

      {/* ── Screen bezel — raised dark surround ── */}
      <rect x="86" y="76" width="362" height="290" rx="10"
        fill="#252220"
      />
      {/* Outer bezel edge highlight */}
      <rect x="86" y="76" width="362" height="290" rx="10"
        fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
      />
      {/* Inner bezel shadow line */}
      <rect x="98" y="88" width="338" height="256" rx="5"
        fill="none"
        stroke="rgba(0,0,0,0.5)" strokeWidth="1.5"
      />

      {/* ── Screen glass / CRT surface ── */}
      <rect x="100" y="90" width="336" height="254" rx="4"
        fill="#101210"
      />
      {/* CRT phosphor faint glow */}
      <rect x="100" y="90" width="336" height="254" rx="4"
        fill="url(#crtGlow)"
      />
      {/* Glass sheen / reflection */}
      <rect x="100" y="90" width="336" height="254" rx="4"
        fill="url(#screenSheen)"
      />

      {/* ── Below-screen area: branding ── */}

      {/* Recessed channel (sculpted ridge) between bezel and bottom */}
      <rect x="86" y="370" width="362" height="10" rx="3"
        fill="rgba(0,0,0,0.1)" />
      <line x1="88" y1="370" x2="446" y2="370"
        stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

      {/* Apple logo — classic rainbow stripes using reference path (24×24 viewBox, scaled 1.9×, centered) */}
      <g transform="translate(268, 416)">
        {/* clipPath uses the canonical Apple path: body + leaf as subpaths */}
        <clipPath id="appleClip">
          <path transform="scale(1.9) translate(-12, -12)"
            d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
        </clipPath>
        {/* Six rainbow stripes, green at top. Rects cover the full scaled bounding box. */}
        <rect x="-16" y="-21" width="33" height="16.5" fill="#71b832" clipPath="url(#appleClip)" />
        <rect x="-16" y="-4.5" width="33" height="5"   fill="#f7be16" clipPath="url(#appleClip)" />
        <rect x="-16" y="0.5"  width="33" height="5"   fill="#f68b1f" clipPath="url(#appleClip)" />
        <rect x="-16" y="5.5"  width="33" height="5"   fill="#e62e27" clipPath="url(#appleClip)" />
        <rect x="-16" y="10.5" width="33" height="5"   fill="#9c4d9b" clipPath="url(#appleClip)" />
        <rect x="-16" y="15.5" width="33" height="6"   fill="#1c7dc0" clipPath="url(#appleClip)" />
        {/* Subtle outline for depth */}
        <path transform="scale(1.9) translate(-12, -12)"
          d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
          fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      </g>

      {/* "Macintosh" model name */}
      <text x="268" y="470"
        textAnchor="middle"
        fontSize="13"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fill="#a89e84"
        letterSpacing="1.5"
      >Macintosh</text>

      {/* Reset / Programmer's switch buttons — left edge of front face */}
      <rect x="58" y="372" width="8" height="14" rx="2" fill="#c0b8a0" />
      <rect x="58" y="372" width="8" height="14" rx="2" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <rect x="58" y="390" width="8" height="14" rx="2" fill="#c0b8a0" />
      <rect x="58" y="390" width="8" height="14" rx="2" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      <text x="70" y="381" fontSize="6" fontFamily="monospace" fill="rgba(0,0,0,0.35)">RST</text>
      <text x="70" y="399" fontSize="6" fontFamily="monospace" fill="rgba(0,0,0,0.35)">INT</text>

      {/* Floppy disk drive slot */}
      <rect x="200" y="490" width="140" height="16" rx="3"
        fill="#1e1c18" />
      <rect x="200" y="490" width="140" height="16" rx="3"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      {/* Slot inner depth */}
      <rect x="204" y="493" width="120" height="9" rx="1.5"
        fill="#0c0b09" />
      <rect x="204" y="493" width="120" height="9" rx="1.5"
        fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      {/* Eject button (barely visible, same beige) */}
      <rect x="332" y="493" width="12" height="9" rx="1.5"
        fill="#2a2820" />
      <text x="338" y="500" fontSize="5" textAnchor="middle" fontFamily="monospace" fill="rgba(255,255,255,0.15)">▲</text>
      <text x="268" y="524" textAnchor="middle" fontSize="7"
        fontFamily="monospace" fill="rgba(120,110,88,0.5)" letterSpacing="1.5">800K</text>

      {/* Horizontal ventilation slots — lower front face */}
      {[0,1,2,3,4].map(i => (
        <rect key={i}
          x="134" y={556 + i * 12}
          width="272" height="5" rx="2"
          fill="rgba(0,0,0,0.14)" />
      ))}
      {/* Vent shadow inset highlight */}
      {[0,1,2,3,4].map(i => (
        <rect key={i}
          x="134" y={561 + i * 12}
          width="272" height="1.5"
          fill="rgba(255,255,255,0.06)" />
      ))}

      {/* Bottom port area — subtle outlines */}
      {/* Thin divider — clearly separates vent zone from I/O port zone */}
      <line x1="86" y1="618" x2="484" y2="618" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <line x1="86" y1="619" x2="484" y2="619" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* ADB port (left) */}
      <rect x="76"  y="626" width="36" height="22" rx="4" fill="rgba(0,0,0,0.1)" />
      <rect x="76"  y="626" width="36" height="22" rx="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <text x="94"  y="622" fontSize="6" textAnchor="middle" fontFamily="monospace" fill="rgba(80,70,55,0.7)" letterSpacing="0.8">ADB</text>
      {/* Serial port 1 */}
      <rect x="124" y="626" width="36" height="22" rx="4" fill="rgba(0,0,0,0.1)" />
      <rect x="124" y="626" width="36" height="22" rx="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <text x="142" y="622" fontSize="6" textAnchor="middle" fontFamily="monospace" fill="rgba(80,70,55,0.7)">▷</text>
      {/* Serial port 2 */}
      <rect x="172" y="626" width="36" height="22" rx="4" fill="rgba(0,0,0,0.1)" />
      <rect x="172" y="626" width="36" height="22" rx="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <text x="190" y="622" fontSize="6" textAnchor="middle" fontFamily="monospace" fill="rgba(80,70,55,0.7)">☎</text>
      {/* SCSI */}
      <rect x="220" y="626" width="60" height="22" rx="4" fill="rgba(0,0,0,0.1)" />
      <rect x="220" y="626" width="60" height="22" rx="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <text x="250" y="622" fontSize="6" textAnchor="middle" fontFamily="monospace" fill="rgba(80,70,55,0.7)" letterSpacing="0.8">SCSI</text>

      {/* Bottom edge / feet */}
      <rect x="52" y="680" width="432" height="12" rx="6"
        fill="rgba(0,0,0,0.08)" />
      {/* Rubber feet */}
      {[80, 180, 340, 440].map(x => (
        <ellipse key={x} cx={x} cy={694} rx="12" ry="5" fill="rgba(0,0,0,0.18)" />
      ))}

      {/* Power LED (tiny) */}
      <circle cx="72" cy="88" r="3.5" fill="#22cc6e" opacity="0.9" />
      <circle cx="72" cy="88" r="5" fill="rgba(34,204,110,0.15)" />
    </svg>
  )
}

// ── Desktop icon component ────────────────────────────────────────────
function DesktopIcon({ app, isSelected, onEnter, onLeave, onTouchTap }) {
  const isDisabled = app.status === 'soon' || app.href === '#'
  const hasSlug    = Boolean(app.slug) && !isDisabled

  const handleTouchEnd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onTouchTap?.()
  }

  const sharedProps = {
    className: `mac-icon ${isSelected ? 'mac-icon--selected' : ''} ${isDisabled ? 'mac-icon--disabled' : ''}`,
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    onFocus: onEnter,
    onBlur: onLeave,
    onTouchEnd: handleTouchEnd,
    style: { '--icon-color': app.color },
  }

  const iconContent = (
    <>
      {/* Icon graphic */}
      <div className="mac-icon-img">
        <div className="mac-icon-face">
          <span className="mac-icon-glyph">{app.icon}</span>
        </div>
        {/* Selection highlight overlay */}
        <div className="mac-icon-select-overlay" />
      </div>
      {/* Label below icon */}
      <div className="mac-icon-label">
        <span>{app.title}</span>
      </div>
    </>
  )

  // Apps with a slug open inside the portfolio as a full-screen iframe
  if (hasSlug) {
    return <Link to={`/apps/${app.slug}`} {...sharedProps}>{iconContent}</Link>
  }

  // Coming soon → non-interactive span
  if (isDisabled) {
    return <span {...sharedProps}>{iconContent}</span>
  }

  // External URL → new tab
  return (
    <a href={app.href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
      {iconContent}
    </a>
  )
}

// ── MacDesktop component ──────────────────────────────────────────────
export default function MacDesktop({ showAll = false }) {
  const [hovered, setHovered] = useState(null)
  const [tapped, setTapped]   = useState(null)  // { app, time } — mobile tap state
  const clearTimer = useRef(null)
  const time = useClockTime()
  const displayApps = showAll ? apps : apps.slice(0, 4)
  const navigate = useNavigate()

  const handleEnter = (app) => {
    if (clearTimer.current) clearTimeout(clearTimer.current)
    setHovered(app)
  }
  const handleLeave = () => {
    clearTimer.current = setTimeout(() => setHovered(null), 80)
  }

  const doOpen = (app) => {
    if (app.status === 'soon' || app.href === '#') return
    if (app.slug) navigate(`/apps/${app.slug}`)
    else window.open(app.href, '_blank', 'noopener,noreferrer')
  }

  const handleTouchTap = (app) => {
    const now = Date.now()
    // Double-tap or second tap on same app → open
    if (tapped?.app?.id === app.id) {
      doOpen(app)
      setTapped(null)
      return
    }
    // First tap → show description
    setTapped({ app, time: now })
  }

  return (
    <div className={`mac-wrapper${showAll ? ' mac-wrapper--expanded' : ''}`}>
      {/* The SVG Mac body */}
      <MacSVG />

      {/* HTML screen overlay — positioned over the glass */}
      <div className="mac-screen-overlay">

        {/* Menu bar */}
        <div className="mac-menu-bar">
          <span className="mac-menu-apple">⌘</span>
          <span className="mac-menu-item">File</span>
          <span className="mac-menu-item">Edit</span>
          <span className="mac-menu-item">View</span>
          <span className="mac-menu-item">Special</span>
          <span className="mac-menu-time">{time}</span>
        </div>

        {/* Desktop area + status bar */}
        <div className="mac-screen-inner" onMouseLeave={handleLeave} onTouchEnd={() => setTapped(null)}>
        <div className="mac-desktop">
          {displayApps.map(app => (
            <DesktopIcon
              key={app.id}
              app={app}
              isSelected={hovered?.id === app.id || tapped?.app?.id === app.id}
              onEnter={() => handleEnter(app)}
              onLeave={() => {}}
              onTouchTap={() => handleTouchTap(app)}
            />
          ))}
        </div>

        {/* Status / info bar — shows description on hover (desktop) or tap (mobile) */}
        {(() => {
          const activeApp = hovered ?? tapped?.app
          return (
            <div className={`mac-status-bar ${activeApp ? 'mac-status-bar--active' : ''}`}>
              {activeApp ? (
                <>
                  <span className="mac-status-tag">{activeApp.category}</span>
                  <span className="mac-status-title">{activeApp.title}</span>
                  {activeApp.status === 'live' && <span className="mac-status-dot mac-status-dot--live" />}
                  {activeApp.status === 'beta' && <span className="mac-status-dot mac-status-dot--beta" />}
                  <span className="mac-status-desc">{activeApp.description}</span>
                  {tapped && !hovered && <span className="mac-status-hint">Tap again to open →</span>}
                </>
              ) : (
                <span className="mac-status-idle">
                  {displayApps.length} items · MW Desktop
                </span>
              )}
            </div>
          )
        })()}
        </div>
      </div>
    </div>
  )
}
