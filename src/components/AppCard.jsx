// AppCard — each app is a framed canvas hanging on a gallery wall.
// The border IS the frame. The hard shadow creates depth off the wall.
// Hover lifts the piece diagonally, shadow grows.

export default function AppCard({ app }) {
  const statusLabel = { live: 'Live', beta: 'Beta', soon: 'Soon' }
  const statusClass = { live: 'status-live', beta: 'status-beta', soon: 'status-soon' }
  const isExternal = app.href !== '#'

  // 27% opacity hex tinted shadow — each piece casts its own colored shadow
  const shadowColor = app.color + '45'

  return (
    <a
      href={app.href}
      className="app-card"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={`Open ${app.title}`}
      style={{
        // Frame border — this IS the ornate frame
        border: `3px solid ${app.color}`,
        // Colored hard drop shadow — no blur, very graphic/3D
        '--card-shadow': shadowColor,
        '--card-color': app.color,
        // Double-frame effect: thin outer white border (the mat)
        outline: '1.5px solid rgba(255,255,255,0.06)',
        outlineOffset: '4px',
      }}
    >
      {/* Artwork interior — abstract composition inside the frame */}
      <div
        className="app-card-image"
        style={{ background: `${app.color}14`, position: 'relative', overflow: 'hidden' }}
      >
        {/* Large background shape — like a painted field */}
        <div style={{
          position: 'absolute',
          width: '65%', height: '90%',
          left: '8%', top: '5%',
          background: `${app.color}30`,
        }} />
        {/* Smaller foreground block */}
        <div style={{
          position: 'absolute',
          width: '30%', height: '45%',
          right: '8%', bottom: '10%',
          background: `${app.color}55`,
        }} />
        {/* Tiny accent square — top left */}
        <div style={{
          position: 'absolute',
          width: '12%', height: '18%',
          left: '10%', top: '12%',
          background: `${app.color}80`,
        }} />

        {/* Icon — centered, above the shapes */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          <span className="app-card-icon" style={{ color: app.color }}>
            {app.icon}
          </span>
        </div>
      </div>

      {/* Card body */}
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
