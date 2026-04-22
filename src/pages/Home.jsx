import { Link } from 'react-router-dom'
import CityscapeScene from '../components/CityscapeScene'
import MacDesktop from '../components/MacDesktop'



export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid-overlay" />

        {/* SVG isometric cityscape — correct projection, painter's algorithm */}
        <CityscapeScene />

        {/* Text — left side, safely clear of the artworks */}
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dash" />
              <span className="label">Software Engineer · Creative Developer</span>
            </div>

            <h1 className="hero-heading">
              Michael
              <br />
              Wegter<span className="hero-heading-mark">.</span>
            </h1>

            <div className="hero-divider" />

            <p className="hero-sub">
              Building useful tools at the intersection of code
              and creativity. Based in the Twin Cities.
            </p>

            <div className="hero-ctas">
              <button
                className="btn btn-primary"
                onClick={() => document.getElementById('featured-apps')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Projects
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="hero-scroll">
              <div className="hero-scroll-line" />
              <span className="hero-scroll-ticker">Scroll</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED APPS — Mac Desktop ─────── */}
      <section id="featured-apps" className="mac-section" style={{ paddingBottom: '0' }}>
        <div className="container mac-section-content">
          <div className="mac-section-header">
            <div>
              <span className="label">Projects &amp; Tools</span>
              <h2 className="section-title">Featured Apps</h2>
            </div>
            <Link to="/apps" className="mac-view-all">
              View all
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
        <MacDesktop />
      </section>

      {/* ── ABOUT — color-blocked gallery panel ──── */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', padding: '0 0 var(--section-pad)' }}>
        <div className="container">
          <div className="about-grid" style={{ alignItems: 'stretch', gap: '40px', paddingTop: '20px' }}>

            {/* Left — bold color block, like a gallery label card */}
            <div style={{
              background: 'var(--mustard)',
              padding: '44px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '10px 10px 0 rgba(0,0,0,0.5)',
            }}>
              {/* Small decorative shapes inside the block */}
              <div style={{
                position: 'absolute', bottom: 24, right: 24,
                width: 56, height: 56,
                background: 'rgba(0,0,0,0.12)',
              }} />
              <div style={{
                position: 'absolute', top: 24, right: 56,
                width: 28, height: 28,
                background: 'rgba(0,0,0,0.1)',
              }} />

              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.5)',
                  display: 'block',
                  marginBottom: '16px',
                }}>
                  About
                </span>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.0,
                  color: '#111',
                }}>
                  About<br />Michael.
                </h2>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: 'rgba(0,0,0,0.45)',
                marginTop: '32px',
              }}>
                Twin Cities, MN
              </div>
            </div>

            {/* Right — description */}
            <div style={{ padding: '44px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
                I'm a software engineer who builds things that are both functional and beautiful.
                I believe great software can solve problems big and small, and should help people.
              </p>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '36px' }}>
                This site is home to my portfolio, personal projects, and tools
                I've built for others to use. Take a look around.
              </p>

              {/* Book-spine strip — palette as a shelf */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '36px',
                alignItems: 'flex-end',
              }}>
                {[
                  { color: '#e8b820', h: 48, w: 28 },
                  { color: '#12b4c8', h: 64, w: 20 },
                  { color: '#f0186e', h: 56, w: 24 },
                  { color: '#e83828', h: 44, w: 18 },
                  { color: '#6ed46a', h: 60, w: 22 },
                  { color: '#3a8fcc', h: 52, w: 26 },
                  { color: '#e8b820', h: 40, w: 16 },
                  { color: '#f0186e', h: 54, w: 20 },
                  { color: '#12b4c8', h: 46, w: 18 },
                ].map((spine, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    style={{
                      background: spine.color,
                      width: spine.w,
                      height: spine.h,
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  />
                ))}
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: 'var(--border-default)',
                  alignSelf: 'flex-end',
                  marginLeft: '4px',
                }} />
              </div>

              <Link to="/experience" className="btn btn-outline" style={{ alignSelf: 'flex-start', fontSize: '13px' }}
                    onClick={() => window.scrollTo(0, 0)}>
                View Experience
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
