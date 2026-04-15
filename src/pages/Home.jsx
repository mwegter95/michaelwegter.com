import { Link } from 'react-router-dom'
import MatrixRain from '../components/MatrixRain'
import AppCard from '../components/AppCard'
import { apps } from '../data/apps'

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        {/* Ambient backgrounds */}
        <MatrixRain opacity={0.22} />
        <div className="hero-grid-overlay" />

        {/* Radial glow behind text */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container hero-content">
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-line" />
            <span className="label">Software Engineer · Creative Developer</span>
          </div>

          {/* Main heading */}
          <h1 className="hero-heading">
            Michael
            <br />
            <span className="hero-heading-accent">Wegter</span>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              background: 'var(--accent)',
              borderRadius: '50%',
              marginLeft: '12px',
              verticalAlign: 'middle',
              marginBottom: '14px',
              boxShadow: '0 0 16px var(--accent)',
              animation: 'blink 2s ease-in-out infinite',
            }} />
          </h1>

          {/* Sub-copy */}
          <p className="hero-sub">
            Building useful tools at the intersection of code and creativity.
            Based in Minneapolis — shipping software that people actually want to use.
          </p>

          {/* CTAs */}
          <div className="hero-ctas">
            <Link to="/apps" className="btn btn-primary">
              Explore Projects
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/experience" className="btn btn-outline">
              My Experience
            </Link>
            <Link to="/resume" className="btn btn-ghost">
              Resume ↗
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Scroll
            </span>
          </div>
        </div>
      </section>

      {/* ── FEATURED APPS ────────────────────────── */}
      <section className="section" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-title-group">
              <span className="label">Projects</span>
              <h2 className="section-title">Featured Apps</h2>
            </div>
            <Link
              to="/apps"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'gap 0.2s',
              }}
              className="view-all-link"
            >
              View all
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="apps-grid">
            {apps.map(app => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT STRIP ──────────────────────────── */}
      <section style={{
        padding: '72px 0',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '64px',
            alignItems: 'center',
          }}>
            <div>
              <span className="label" style={{ marginBottom: '16px', display: 'block' }}>About</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 38px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
              }}>
                Code as a<br />
                <span style={{ color: 'var(--accent)' }}>creative medium.</span>
              </h2>
            </div>
            <div>
              <p style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                marginBottom: '24px',
                maxWidth: '560px',
              }}>
                I'm a software engineer based in Minneapolis who loves building things that are
                both functional and beautifully designed. I believe great software respects
                people's time and makes hard problems feel effortless.
              </p>
              <p style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                maxWidth: '560px',
              }}>
                This site is home to my portfolio, personal projects, and tools I've built
                for others to use. Take a look around.
              </p>
              <div style={{ marginTop: '28px' }}>
                <Link to="/experience" className="btn btn-outline" style={{ fontSize: '13px' }}>
                  View Experience
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blink keyframe */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .view-all-link:hover {
          gap: 10px !important;
        }
        @media (max-width: 700px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </>
  )
}
