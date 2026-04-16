/**
 * AppFrame — full-viewport iframe shell for embedded apps.
 *
 * Used by the /apps/:appId route. Shows the app's navbar label + a back button,
 * then fills the remaining viewport with the app in an iframe.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apps } from '../data/apps'

export default function AppFrame({ appId }) {
  const app = apps.find(a => a.id === appId || a.slug === appId)
  const [loaded, setLoaded] = useState(false)

  // Keep the page title in sync
  useEffect(() => {
    if (app) document.title = `${app.title} — Michael Wegter`
    return () => { document.title = 'Michael Wegter' }
  }, [app])

  if (!app || !app.href || app.href === '#') {
    return (
      <div className="appframe-error">
        <p>App not found or not yet available.</p>
        <Link to="/apps" className="appframe-back-link">← Back to Apps</Link>
      </div>
    )
  }

  return (
    <div className="appframe-shell">
      {/* Thin top bar — just the back button and app name */}
      <div className="appframe-bar">
        <Link to="/apps" className="appframe-back" aria-label="Back to Apps">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Apps
        </Link>
        <span className="appframe-title">{app.title}</span>
        <a className="appframe-external" href={app.href} target="_blank" rel="noopener noreferrer"
           title="Open in new tab">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
            <path d="M6 3H3v10h10v-3M9 3h4v4M13 3l-6 6"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* The app iframe */}
      {!loaded && (
        <div className="appframe-loading">
          <div className="appframe-spinner" />
          <span>Loading {app.title}…</span>
        </div>
      )}
      <iframe
        src={app.href}
        title={app.title}
        className="appframe-iframe"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}
