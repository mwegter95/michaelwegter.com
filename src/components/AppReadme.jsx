import { apps } from '../data/apps'

/* ─────────────────────────────────────────────────────────
   Deep-dive copy and screenshot specs for each app.
   Screenshots are placeholders — replace src with real images.
──────────────────────────────────────────────────────────── */
const details = {
  'gallery-wall': {
    tagline: 'Plan gallery walls to scale — before driving a single nail.',
    paragraphs: [
      "Planning a gallery wall usually means a lot of eyeballing, tape-measure squinting, and at least one round of nail-hole spackling. Gallery Wall Planner replaces all of that with a to-scale digital canvas that mirrors your exact wall dimensions. You measure your wall and pieces once, enter the numbers, and from there it's pure drag-and-drop.",
      'Every element is calibrated to real-world inches. Pieces stay in proportion to the wall; rulers mark feet and inches along every edge; a snap-to-grid keeps everything aligned. When you find an arrangement you like, save it as a named layout — compare multiple side-by-side any time. Your piece library travels with you too: add an art piece once and reuse it across every wall.',
      "The perspective-calibration tool lets you photograph your actual wall and warp the photo into a true-to-life backdrop, so the preview on screen closely matches what you'll see on the wall.",
    ],
    features: [
      'Drag, resize, and stack art pieces on a scale-accurate wall canvas',
      'Upload a room photo and calibrate its perspective as a live backdrop',
      'Foot-and-inch rulers with toggleable snap-to-grid for precise placement',
      'Piece library — save any piece once, reuse it across all your walls',
      'Named layouts — save and reload multiple arrangements any time',
      'Undo history, piece locking, and layering controls (bring forward / send back)',
      'Session restore — your last layout reloads automatically after login or page refresh',
    ],
    screenshots: [
      {
        alt: 'Main wall canvas with several framed art pieces arranged across a beige wall surface. Foot-and-inch rulers run along the top and left edges. The Pieces sidebar is open on the right showing a list of each piece with its dimensions.',
        caption: 'The main canvas — drag, resize, and layer pieces freely',
        aspect: 16 / 9,
        wide: true,
      },
      {
        alt: 'Wall calibration tool showing a living room photo with a perspective-correction overlay. Four corner handles let the user align the photo to the real wall shape.',
        caption: 'Perspective calibration — wrap a real photo around your wall dimensions',
        aspect: 16 / 9,
      },
      {
        alt: 'The Layouts tab in the sidebar listing three saved layouts — "Living Room", "Bedroom Wall", "Staircase" — each with a piece count, a Load button, and a delete icon.',
        caption: 'Saved layouts — switch between arrangements in one click',
        aspect: 4 / 3,
      },
      {
        alt: 'The Library tab showing a grid of saved piece thumbnails. Each card shows the piece photo, name, and dimensions, with a green "+ Add" button to place it on the current wall.',
        caption: 'Piece library — your collection persists across every wall',
        aspect: 4 / 3,
      },
    ],
  },

  'seo-analyzer': {
    tagline: 'SEO audits that see what search engines actually see — JavaScript rendered.',
    paragraphs: [
      'Most SEO tools scrape raw HTML off the wire and call it done. That worked in 2010. Today, a huge share of web content is injected by JavaScript after the initial page load — and those tools miss all of it. The SEO Analyzer runs every URL through a headless browser, so it sees the fully-rendered DOM exactly as Googlebot does after JS executes.',
      'Once the page is rendered, the analyzer scores it across 30+ factors covering technical infrastructure (HTTPS, canonical tags, hreflang, robots directives), content quality (title and meta description length, heading structure, image alt text), and performance signals. Results are organized by category with numeric scores, severity flags, and plain-English explanations for each issue — so you know exactly what to fix and why.',
    ],
    features: [
      'Headless-browser rendering — JS-injected content is fully visible to the analyzer',
      '30+ scored factors across technical, content, and performance categories',
      'Clear pass / warn / fail flags with actionable fix-it explanations',
      'Works on any public URL — no account, no plugin, no installation required',
      'Scores organized by category so you can triage and prioritize at a glance',
    ],
    screenshots: [
      {
        alt: 'The main input field with a URL typed in and a large "Analyze" button below it. The page background is dark with the tool title at the top.',
        caption: 'Paste any public URL to kick off the audit',
        aspect: 16 / 9,
        wide: true,
      },
      {
        alt: 'Audit results dashboard showing an overall score of 78/100 as a large number. Below it, category cards show sub-scores for Technical, Content, and Performance.',
        caption: 'Overall score and category breakdown in one view',
        aspect: 16 / 9,
      },
      {
        alt: 'A detailed factor row showing "Missing image alt text" marked as WARN. Below the flag are the specific images that triggered it and a paragraph explaining why alt text matters for both SEO and accessibility.',
        caption: 'Every factor explains itself and tells you exactly how to fix it',
        aspect: 16 / 9,
      },
    ],
  },

  'spotify-tools': {
    tagline: "Power features Spotify should ship but hasn't — for listeners who live in their library.",
    paragraphs: [
      "Spotify's apps are beautifully polished but weirdly limited the moment you try to manage your library at scale. You can't export a playlist, you can't bulk-build one from a text list, and there's no native way to create a clean version of your favorite playlist for a car ride or kids' room. This tool fills all three gaps.",
      'The track extractor pulls every song from any playlist into a clean, copyable list — perfect for backups, sharing outside Spotify, or importing into another tool. The playlist builder does the reverse: paste in "Artist — Song" lines and it finds and queues each track, building playlists from anywhere in seconds. The clean playlist builder scans any playlist for explicit tracks and creates a parallel clean version, automatically swapping each one for its censored equivalent wherever Spotify offers one.',
    ],
    features: [
      'Extract any playlist as a clean, copyable track list — perfect for backups or sharing',
      'Build a new Spotify playlist from a typed or pasted list of songs',
      'Create a clean (non-explicit) version of any playlist automatically',
      'Works with your own playlists and any public playlist you can link to',
      "Secure Spotify OAuth login — your credentials never touch this server",
    ],
    screenshots: [
      {
        alt: 'Main tool interface showing three large option cards side-by-side: "Extract Playlist" with a download icon, "Build Playlist" with a list icon, and "Make It Clean" with a sparkle icon.',
        caption: 'Three tools in one — each one fills a real gap in Spotify',
        aspect: 16 / 9,
        wide: true,
      },
      {
        alt: 'Playlist extraction result: a numbered list of tracks showing artist name and song title. A "Copy all" button sits at the top right.',
        caption: 'Extracted track list — ready to copy, save, or paste anywhere',
        aspect: 16 / 9,
      },
      {
        alt: 'The clean playlist builder showing two columns: "Original" on the left with explicit tracks highlighted in red, and "Clean version" on the right showing matched replacements. Tracks with no clean equivalent are flagged.',
        caption: 'Explicit tracks flagged and swapped automatically where possible',
        aspect: 16 / 9,
      },
    ],
  },
}

/* ── Screenshot placeholder ─────────────────────────────── */
function ScreenshotPlaceholder({ shot, color }) {
  const paddingTop = `${(1 / shot.aspect) * 100}%`
  return (
    <figure className="app-screenshot">
      <div className="app-screenshot-frame" style={{ paddingTop, '--shot-color': color }}>
        <div className="app-screenshot-inner">
          <span className="app-screenshot-icon">📷</span>
          <p className="app-screenshot-alttext">{shot.alt}</p>
        </div>
      </div>
      <figcaption className="app-screenshot-caption">{shot.caption}</figcaption>
    </figure>
  )
}

/* ── Feature list ───────────────────────────────────────── */
function FeatureList({ items, color }) {
  return (
    <ul className="app-feature-list">
      {items.map((item, i) => (
        <li key={i} className="app-feature-item">
          <span className="app-feature-dot" style={{ background: color }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/* ── Single app deep-dive section ───────────────────────── */
function AppSection({ app }) {
  const d = details[app.slug]
  if (!d) return null
  const { tagline, paragraphs, features, screenshots } = d
  const heroShot = screenshots[0]
  const restShots = screenshots.slice(1)

  return (
    <section
      id={`app-${app.slug}`}
      className="app-detail"
      style={{ '--app-color': app.color }}
    >
      <div className="container">

        {/* ── Header band ──────────────────────────── */}
        <div className="app-detail-header">
          <div className="app-detail-accent" />
          <div className="app-detail-header-inner">
            <div className="app-detail-title-row">
              <span className="app-detail-badge">{app.icon}</span>
              <div>
                <span
                  className="label"
                  style={{ color: app.color, marginBottom: '6px', display: 'block' }}
                >
                  {app.category}
                  {app.status === 'live' && (
                    <span className="app-detail-live-dot" />
                  )}
                </span>
                <h2 className="app-detail-name">{app.title}</h2>
                <p className="app-detail-tagline">{tagline}</p>
              </div>
            </div>
            <a
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline app-detail-cta"
              style={{ borderColor: app.color, color: app.color }}
            >
              Open App
              <svg viewBox="0 0 16 16" width="11" height="11" fill="none" aria-hidden="true">
                <path d="M3 3h10v10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────── */}
        <div className="app-detail-body">

          {/* Hero screenshot (full width) */}
          <div className="app-detail-hero-shot">
            <ScreenshotPlaceholder shot={heroShot} color={app.color} />
          </div>

          {/* Description + Features */}
          <div className="app-detail-prose-col">
            <div className="app-detail-prose">
              {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <div className="app-detail-features">
              <h3
                className="app-detail-features-heading"
                style={{ color: app.color }}
              >
                What you can do
              </h3>
              <FeatureList items={features} color={app.color} />
            </div>
          </div>

          {/* Secondary screenshots grid */}
          {restShots.length > 0 && (
            <div className="app-detail-shots-grid">
              {restShots.map((shot, i) => (
                <ScreenshotPlaceholder key={i} shot={shot} color={app.color} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Main export ─────────────────────────────────────────── */
export default function AppReadme() {
  const liveApps = apps.filter(a => a.slug && details[a.slug])

  return (
    <div className="app-readme">

      {/* ── Section intro + TOC ────────────────── */}
      <div className="container">
        <div className="app-readme-intro">
          <div className="app-readme-intro-text">
            <span className="label" style={{ display: 'block', marginBottom: '12px' }}>
              Documentation
            </span>
            <h2 className="app-readme-heading">App Deep Dives</h2>
            <p className="app-readme-sub">
              Full write-ups on what each app does, how to use it, and why it was built.
              Jump to any section or scroll through all three.
            </p>
          </div>

          <nav className="app-readme-toc" aria-label="Jump to app documentation">
            {liveApps.map(app => (
              <a
                key={app.id}
                href={`#app-${app.slug}`}
                className="app-toc-pill"
                style={{ '--pill-color': app.color }}
              >
                <span className="app-toc-pill-icon">{app.icon}</span>
                <span className="app-toc-pill-label">{app.title}</span>
                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" aria-hidden="true" className="app-toc-pill-arrow">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ── App sections ───────────────────────── */}
      {liveApps.map(app => (
        <AppSection key={app.id} app={app} />
      ))}
    </div>
  )
}
