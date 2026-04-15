import AppCard from '../components/AppCard'
import { apps } from '../data/apps'

export default function Apps() {
  return (
    <section style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: '72px 0' }}>
      <div className="container">

        {/* Page header */}
        <div style={{ marginBottom: '64px', maxWidth: '640px' }}>
          <span className="label" style={{ display: 'block', marginBottom: '16px' }}>
            Projects &amp; Tools
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: 'var(--text-primary)',
            marginBottom: '20px',
          }}>
            Apps
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            Tools I've built for real-world use. Click any tile to open the app.
            More coming regularly — check back.
          </p>
        </div>

        {/* Divider */}
        <div className="section-divider" />

        {/* Grid */}
        <div className="apps-grid">
          {apps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

      </div>
    </section>
  )
}
