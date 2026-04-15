// AppCard — reusable tile for the apps grid
export default function AppCard({ app }) {
  const statusLabel = {
    live: 'Live',
    beta: 'Beta',
    soon: 'Soon',
  }

  const statusClass = {
    live: 'status-live',
    beta: 'status-beta',
    soon: 'status-soon',
  }

  const isExternal = app.href !== '#'

  return (
    <a
      href={app.href}
      className="app-card"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={`Open ${app.title}`}
    >
      {/* Image / preview area */}
      <div className="app-card-image">
        {/* Top accent line */}
        <div
          className="app-card-top-border"
          style={{ background: app.color }}
        />
        <div
          className="app-card-image-placeholder"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${app.color}18 0%, transparent 70%)`,
          }}
        >
          <span
            className="app-card-icon"
            style={{ color: app.color }}
          >
            {app.icon}
          </span>
        </div>
      </div>

      {/* Body */}
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
