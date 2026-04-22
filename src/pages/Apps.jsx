import MacDesktop from '../components/MacDesktop'
import AppReadme from '../components/AppReadme'

export default function Apps() {
  return (
    <>
      <section className="mac-section mac-section-full" style={{ paddingTop: '72px', paddingBottom: '0' }}>
        <div className="container" style={{ paddingTop: '0', paddingBottom: '24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <span className="label" style={{ display: 'block', marginBottom: '12px' }}>Projects &amp; Tools</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 6vw, 68px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>Apps</h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '480px' }}>
              Tools I've built for real-world use.{' '}
              {/* Desktop hint — hidden on touch devices */}
              <span className="hint-desktop">Hover over any icon to learn more. Click to open.</span>
              {/* Mobile hint — hidden on non-touch/desktop */}
              <span className="hint-mobile">Tap any icon to learn more. Tap twice to open.</span>
              {' '}Scroll to the bottom to see app descriptions and screenshots.
            </p>
          </div>
        </div>
        <MacDesktop showAll />
      </section>

      {/* ── App deep-dives ───────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <AppReadme />
      </div>
    </>
  )
}
