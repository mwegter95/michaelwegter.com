import AppCard from '../components/AppCard'
import { apps } from '../data/apps'

export default function Apps() {
  return (
    <section className="gallery-room gallery-room-full">
      {/* 3D room scene */}
      <div className="gallery-scene" aria-hidden="true">
        <div className="gallery-back-wall" />
        <div className="gallery-left-wall" />
        <div className="gallery-right-wall" />
        <div className="gallery-floor" />
        <div className="gallery-crown-molding" />
        <div className="gallery-wainscoting" />
        <div className="gallery-arch gallery-arch-left">
          <div className="gallery-arch-opening" />
        </div>
        <div className="gallery-arch gallery-arch-right">
          <div className="gallery-arch-opening" />
        </div>
        {/* Palm tree */}
        <div className="gallery-palm">
        <svg viewBox="0 0 200 400" width="160" height="320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 340 L120 340 L115 390 L85 390 Z" fill="#5c3a1e" />
          <path d="M72 330 L128 330 L124 345 L76 345 Z" fill="#6b4423" />
          <ellipse cx="100" cy="330" rx="30" ry="5" fill="#7a5230" />
          <path d="M96 180 Q94 260 92 330 L108 330 Q106 260 104 180 Z" fill="#6b4423" stroke="#5c3a1e" strokeWidth="1" />
          <path d="M95 220 Q97 218 105 220" stroke="#5c3a1e" strokeWidth="1" fill="none" />
          <path d="M94 250 Q98 248 106 250" stroke="#5c3a1e" strokeWidth="1" fill="none" />
          <path d="M93 280 Q98 278 107 280" stroke="#5c3a1e" strokeWidth="1" fill="none" />
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

      <div className="container gallery-content" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
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

        <div className="section-divider" />

        <div className="apps-grid">
          {apps.map(app => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </section>
  )
}
