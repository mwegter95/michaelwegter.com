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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apps } from '../data/apps'

// ── SVG sub-components ────────────────────────────────────────────────

function MacSVG() {
  return (
    <svg
      viewBox="0 0 680 760"
      xmlns="http://www.w3.org/2000/svg"
      className="mac-svg"
      aria-hidden="true"
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
        <polygon points="52,44 572,10 572,658 484,692 52,692" fill="#2a2620" opacity="0.4" />
      </g>

      {/* ── Top face — rounded outer corners, fills gap at front face rx ── */}
      <path
        d="M 66,44 L 470,44 Q 484,44 484,57 L 561,16 Q 572,10 557,10 L 150,10 Q 140,10 141,19 L 52,57 Q 52,44 66,44 Z"
        fill="url(#macTop)"
      />
      {/* Top face edge trim — only the flat front segment */}
      <line x1="66" y1="44" x2="470" y2="44" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />

      {/* ── Right face — rounded outer corners, endpoints match front face rx ── */}
      <path
        d="M 484,57 L 561,16 Q 572,10 572,22 L 572,645 Q 572,658 561,661 L 484,680 Z"
        fill="url(#macRight)"
      />
      {/* Right face highlight along left edge */}
      <line x1="484" y1="57" x2="484" y2="680" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
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

      {/* Apple logo — classic rainbow stripes with proper circular bite */}
      <g transform="translate(268, 416)">
        <clipPath id="appleClip">
          {/* Body + leaf compound path; bite is a deep concave cubic arc on upper right */}
          <path d="M 4,-22 C -4,-24 -18,-16 -22,-6 C -26,6 -22,18 -14,26 C -8,32 2,32 6,30 C 10,32 18,28 20,20 C 24,12 24,2 20,-2 C 30,-4 28,-18 18,-18 C 12,-22 6,-24 4,-22 Z M 4,-22 C 8,-34 22,-30 16,-20 Z" />
        </clipPath>
        {/* Six-color stripes — green at top, blue at bottom */}
        <rect x="-26" y="-24" width="50" height="9"  fill="#71b832" clipPath="url(#appleClip)" />
        <rect x="-26" y="-15" width="50" height="9"  fill="#f7be16" clipPath="url(#appleClip)" />
        <rect x="-26" y="-6"  width="50" height="9"  fill="#f68b1f" clipPath="url(#appleClip)" />
        <rect x="-26" y="3"   width="50" height="9"  fill="#e62e27" clipPath="url(#appleClip)" />
        <rect x="-26" y="12"  width="50" height="9"  fill="#9c4d9b" clipPath="url(#appleClip)" />
        <rect x="-26" y="21"  width="50" height="11" fill="#1c7dc0" clipPath="url(#appleClip)" />
        {/* Body outline showing the bite */}
        <path d="M 4,-22 C -4,-24 -18,-16 -22,-6 C -26,6 -22,18 -14,26 C -8,32 2,32 6,30 C 10,32 18,28 20,20 C 24,12 24,2 20,-2 C 30,-4 28,-18 18,-18 C 12,-22 6,-24 4,-22 Z"
          fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
        {/* Leaf */}
        <path d="M 4,-22 C 8,-34 22,-30 16,-20 Z" fill="#71b832" />
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
function DesktopIcon({ app, isSelected, onEnter, onLeave }) {
  const isExternal = app.href !== '#'
  const isDisabled = app.status === 'soon'

  return (
    <a
      href={isDisabled ? undefined : app.href}
      target={isExternal && !isDisabled ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`mac-icon ${isSelected ? 'mac-icon--selected' : ''} ${isDisabled ? 'mac-icon--disabled' : ''}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      style={{ '--icon-color': app.color }}
    >
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
    </a>
  )
}

// ── MacDesktop component ──────────────────────────────────────────────
export default function MacDesktop({ showAll = false }) {
  const [hovered, setHovered] = useState(null)
  const displayApps = showAll ? apps : apps.slice(0, 4)

  return (
    <div className="mac-wrapper">
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
          <span className="mac-menu-time">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>

        {/* Desktop area — icon grid */}
        <div className="mac-desktop">
          {displayApps.map(app => (
            <DesktopIcon
              key={app.id}
              app={app}
              isSelected={hovered?.id === app.id}
              onEnter={() => setHovered(app)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>

        {/* Status / info bar — shows description on hover */}
        <div className={`mac-status-bar ${hovered ? 'mac-status-bar--active' : ''}`}>
          {hovered ? (
            <>
              <span className="mac-status-tag">{hovered.category}</span>
              <span className="mac-status-title">{hovered.title}</span>
              <span className="mac-status-sep">—</span>
              <span className="mac-status-desc">{hovered.description}</span>
              {hovered.status === 'live' && <span className="mac-status-dot mac-status-dot--live" />}
              {hovered.status === 'beta' && <span className="mac-status-dot mac-status-dot--beta" />}
            </>
          ) : (
            <span className="mac-status-idle">
              {displayApps.length} items · MW Desktop
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
