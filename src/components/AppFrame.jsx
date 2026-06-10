/**
 * AppFrame — full-viewport iframe shell for embedded apps.
 *
 * Used by the /apps/:appId route. Shows the app's navbar label + a back button,
 * then fills the remaining viewport with the app in an iframe.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apps } from '../data/apps'
import { workSamples } from '../data/workSamples'

export default function AppFrame({ appId }) {
  const app = [...apps, ...workSamples].find(a => a.id === appId || a.slug === appId)
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef(null)
  // Auto-resize iframe to match its content height when the embedded app
  // postMessages it. Used by apps that opt in (life-dashboard, growyard) to
  // dodge an iOS Safari iframe scroll-bubbling bug where the user has to
  // stop-and-scroll-again to reach content near the bottom. With the iframe
  // sized to its content, the parent page does all the scrolling and the bug
  // goes away.
  const [contentHeight, setContentHeight] = useState(null)

  // Keep the page title in sync
  useEffect(() => {
    if (app) document.title = `${app.title} — Michael Wegter`
    return () => { document.title = 'Michael Wegter' }
  }, [app])

  // Switching apps resets to flex-fill mode; the next app re-reports its own
  // height if it opts in, so one app's height never leaks onto another.
  useEffect(() => { setContentHeight(null) }, [appId])

  // Listen for height messages from embedded apps that opt in. Any app can
  // participate by posting { type: '<app>:height', height: <px> } to its
  // parent (see e.g. life-dashboard / growyard src/main.jsx).
  useEffect(() => {
    function onMessage(e) {
      const d = e.data
      if (!d || typeof d !== 'object') return
      if (typeof d.type === 'string' && d.type.endsWith(':height') && typeof d.height === 'number') {
        // Cap to a sane maximum so a misbehaving app can't blow up layout.
        setContentHeight(Math.min(d.height, 12000))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // ── Embedded-app auth bridge ───────────────────────────────────────────────
  // Embedded apps are served from a different origin (e.g. mwegter95.github.io),
  // so Safari treats their iframe localStorage as third-party and evicts it
  // within a day or two — logging the user out long before their 7-day token
  // expires. We keep each app's token in THIS page's first-party localStorage
  // (durable) and hand it back when the app boots. The app mirrors its token up
  // here on login/logout. See e.g. life-dashboard/src/lib/embedAuth.js.
  useEffect(() => {
    if (!app?.href) return
    let appOrigin
    try { appOrigin = new URL(app.href, window.location.href).origin } catch { return }
    const tokenKey = `mw-embed-auth:${app.slug || app.id}`

    const postToken = () => {
      const frame = iframeRef.current
      if (!frame?.contentWindow) return
      let token = null
      try { token = localStorage.getItem(tokenKey) } catch {}
      frame.contentWindow.postMessage({ type: 'mw-embed-auth', action: 'token', token }, appOrigin)
    }
    function onMessage(e) {
      if (e.origin !== appOrigin || e.source !== iframeRef.current?.contentWindow) return
      const d = e.data
      if (!d || d.type !== 'mw-embed-auth') return
      if (d.action === 'request') postToken()
      else if (d.action === 'set' && typeof d.token === 'string') {
        try { localStorage.setItem(tokenKey, d.token) } catch {}
      } else if (d.action === 'clear') {
        try { localStorage.removeItem(tokenKey) } catch {}
      }
    }
    window.addEventListener('message', onMessage)
    if (loaded) postToken()   // covers an app whose boot request raced this listener
    return () => window.removeEventListener('message', onMessage)
  }, [app, loaded])

  // Tell embedded apps which part of their naturally-sized iframe is visible
  // in the parent viewport, so in-app fixed UI (modals) can center there.
  useEffect(() => {
    if (!loaded) return
    let raf = 0
    const postViewport = () => {
      raf = 0
      const frame = iframeRef.current
      if (!frame?.contentWindow) return
      const rect = frame.getBoundingClientRect()
      const vv = window.visualViewport
      const viewportTop = vv?.offsetTop ?? 0
      const viewportHeight = vv?.height ?? window.innerHeight
      const barBottom = document.querySelector('.appframe-bar')?.getBoundingClientRect().bottom ?? viewportTop
      const visibleTop = Math.max(viewportTop, barBottom)
      const visibleBottom = viewportTop + viewportHeight
      const top = Math.max(0, visibleTop - rect.top)
      const bottom = Math.min(rect.height, visibleBottom - rect.top)
      frame.contentWindow.postMessage({
        type: 'appframe:viewport',
        top,
        height: Math.max(0, bottom - top),
      }, '*')
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(postViewport)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true })
    window.visualViewport?.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('scroll', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [loaded, contentHeight])

  if (!app || !app.href || app.href === '#') {
    return (
      <div className="appframe-error">
        <p>App not found or not yet available.</p>
        <Link to="/apps" className="appframe-back-link">← Back to Apps</Link>
      </div>
    )
  }

  // When the embedded app reports a height, switch to "natural-height" mode
  // (parent page handles scroll). Otherwise stay in flex-fill mode.
  const shellClass = `appframe-shell ${contentHeight ? 'appframe-shell--natural' : ''}`
  return (
    <div className={shellClass}>
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
        ref={iframeRef}
        src={app.href}
        title={app.title}
        className="appframe-iframe"
        style={{
          opacity: loaded ? 1 : 0,
          ...(contentHeight ? { height: `${contentHeight}px`, flex: 'none' } : null),
        }}
        onLoad={() => setLoaded(true)}
        allow="clipboard-read; clipboard-write; xr-spatial-tracking; camera; gyroscope; accelerometer"
      />
    </div>
  )
}
