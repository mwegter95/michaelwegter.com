import { Link } from 'react-router-dom'
import AppCard from '../components/AppCard'
import { apps } from '../data/apps'
import CityscapeScene from '../components/CityscapeScene'



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
              and creativity. Based in Minneapolis.
            </p>

            <div className="hero-ctas">
              <Link to="/apps" className="btn btn-primary">
                Explore Projects
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/experience" className="btn btn-outline">Experience</Link>
              <Link to="/resume" className="btn btn-ghost">Resume ↗</Link>
            </div>

            <div className="hero-scroll">
              <div className="hero-scroll-line" />
              <span className="hero-scroll-ticker">Scroll</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED APPS — Gallery Room ─────── */}
      <section className="gallery-room">
        {/* 3D room scene — all decorative background elements */}
        <div className="gallery-scene" aria-hidden="true">
          <div className="gallery-back-wall" />
          <div className="gallery-left-wall" />
          <div className="gallery-right-wall" />
          <div className="gallery-floor" />
          <div className="gallery-crown-molding" />
          <div className="gallery-wainscoting" />
          {/* Full-height left archway — leads to a 3D corridor */}
          <div className="gallery-arch gallery-arch-left">
            <div className="gallery-arch-opening" />
          </div>
          {/* Full-height right archway */}
          <div className="gallery-arch gallery-arch-right">
            <div className="gallery-arch-opening" />
          </div>
          {/* Palm tree */}
          <div className="gallery-palm">
          <svg viewBox="0 0 200 400" width="180" height="360" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pot */}
            <path d="M80 340 L120 340 L115 390 L85 390 Z" fill="#5c3a1e" />
            <path d="M72 330 L128 330 L124 345 L76 345 Z" fill="#6b4423" />
            <ellipse cx="100" cy="330" rx="30" ry="5" fill="#7a5230" />
            {/* Trunk */}
            <path d="M96 180 Q94 260 92 330 L108 330 Q106 260 104 180 Z" fill="#6b4423" stroke="#5c3a1e" strokeWidth="1" />
            <path d="M95 220 Q97 218 105 220" stroke="#5c3a1e" strokeWidth="1" fill="none" />
            <path d="M94 250 Q98 248 106 250" stroke="#5c3a1e" strokeWidth="1" fill="none" />
            <path d="M93 280 Q98 278 107 280" stroke="#5c3a1e" strokeWidth="1" fill="none" />
            <path d="M93 310 Q98 308 107 310" stroke="#5c3a1e" strokeWidth="1" fill="none" />
            {/* Fronds */}
            <path d="M100 180 Q60 120 10 100 Q60 130 80 165 Q70 130 30 80 Q70 135 88 165 Z" fill="#2d6b3f" />
            <path d="M100 180 Q140 120 190 100 Q140 130 120 165 Q130 130 170 80 Q130 135 112 165 Z" fill="#2d6b3f" />
            <path d="M100 180 Q50 140 5 155 Q55 150 82 170 Q50 155 15 170 Q58 160 85 175 Z" fill="#348a4a" />
            <path d="M100 180 Q150 140 195 155 Q145 150 118 170 Q150 155 185 170 Q142 160 115 175 Z" fill="#348a4a" />
            <path d="M100 180 Q80 100 60 40 Q85 105 95 165 Q78 90 55 30 Q84 110 96 170 Z" fill="#3a7d48" />
            <path d="M100 180 Q120 100 140 40 Q115 105 105 165 Q122 90 145 30 Q116 110 104 170 Z" fill="#3a7d48" />
            <path d="M100 180 Q40 160 -10 180 Q50 165 84 178 Z" fill="#45a050" opacity="0.7" />
            <path d="M100 180 Q160 160 210 180 Q150 165 116 178 Z" fill="#45a050" opacity="0.7" />
          </svg>
          </div>
        </div>

        {/* Content — floats above the room */}
        <div className="container gallery-content">
          <div className="section-header">
            <div className="section-title-group">
              <span className="label">Projects &amp; Tools</span>
              <h2 className="section-title">Featured Apps</h2>
            </div>
            <Link
              to="/apps"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--mustard)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '4px',
                transition: 'gap 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.gap = '14px'}
              onMouseLeave={e => e.currentTarget.style.gap = '8px'}
            >
              View all
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="apps-grid">
            {apps.map(app => <AppCard key={app.id} app={app} />)}
          </div>
        </div>
      </section>

      {/* ── ABOUT — color-blocked gallery panel ──── */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', padding: '0 0 var(--section-pad)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', alignItems: 'stretch', gap: '40px', paddingTop: 'var(--section-pad)' }}>

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
                  Code as a<br />creative<br />medium.
                </h2>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: 'rgba(0,0,0,0.45)',
                marginTop: '32px',
              }}>
                Minneapolis, MN
              </div>
            </div>

            {/* Right — description */}
            <div style={{ padding: '44px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
                I'm a software engineer who builds things that are both
                functional and beautifully considered. I believe great software
                respects people's time and makes hard problems feel effortless.
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

              <Link to="/experience" className="btn btn-outline" style={{ alignSelf: 'flex-start', fontSize: '13px' }}>
                View Experience
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
