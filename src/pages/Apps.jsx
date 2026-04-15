import MacDesktop from '../components/MacDesktop'

export default function Apps() {
  return (
    <section className="mac-section mac-section-full">
      <div className="container" style={{ paddingTop: '64px', paddingBottom: '48px' }}>
        <div style={{ marginBottom: '40px' }}>
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
            Tools I've built for real-world use. Hover any icon to explore.
          </p>
        </div>
      </div>
      <MacDesktop showAll />
    </section>
  )
}
