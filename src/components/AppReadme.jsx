import { useState, useEffect, useCallback } from 'react'
import { apps } from '../data/apps'

/* ─────────────────────────────────────────────────────────
   Media + copy data for each app.
──────────────────────────────────────────────────────────── */
const details = {
  'gallery-wall': {
    tagline: 'Plan your gallery wall layout to the inch — before you hang a single piece.',
    paragraphs: [
      "Gallery Wall Planner is a free online gallery wall planner that replaces guesswork with precision. Planning a gallery wall usually means tape-measure squinting and at least one round of nail-hole spackling. This gallery wall layout tool gives you a scale-accurate digital canvas that mirrors your exact wall dimensions — measure your wall and pieces once, enter the numbers, and arrange your gallery wall before committing to a single hole.",
      "Every element is calibrated to real-world inches, so you can design a gallery wall that translates directly to the physical wall. A foot-and-inch ruler runs along every edge; snap-to-grid keeps your picture arrangement tight. Save named gallery wall layouts and flip between multiple designs side-by-side. Your piece library persists — add any frame or art piece once and reuse it across every wall you plan.",
      "The perspective-calibration tool lets you photograph your actual wall and warp the photo into a true-to-life backdrop, giving you a realistic preview of exactly how your gallery wall will look before you pick up a hammer. It's the closest thing to a gallery wall simulator you can run in a browser.",
    ],
    features: [
      'Free online gallery wall planner with a fully scale-accurate canvas',
      'Drag-and-drop gallery wall layout — arrange frames and art in real-time',
      'Upload a room photo and calibrate its perspective as a live backdrop',
      'Foot-and-inch rulers with snap-to-grid for precise picture placement',
      'Piece library — save any frame or art piece once, reuse it across all your walls',
      'Named layouts — save and compare multiple gallery wall designs any time',
      'Session restore — your last gallery wall layout reloads automatically',
    ],
    screenshots: [
      {
        src: '/screenshots/gallery_wall_planner_drag_and_drop_main_demo.mp4',
        type: 'video',
        alt: 'Screen recording of the Gallery Wall Planner canvas — a user drags and repositions framed art pieces across a scale-accurate wall canvas. Foot-and-inch rulers run along the top and left edges, and the Pieces sidebar is visible on the right.',
        caption: 'The main canvas — drag, resize, and layer pieces freely',
        aspect: 16 / 9,
        wide: true,
      },
      {
        src: '/screenshots/gallery_wall_planner_wall_warp_perspective.png',
        type: 'image',
        alt: "Gallery Wall Planner perspective calibration screen titled 'Calibrate — Bedroom East Wall 2'. A real photo of a sage-green bedroom wall with a white dresser and lamp is overlaid with a dotted quadrilateral and four colored corner handles. Wall dimensions are set to 128 × 95 inches.",
        caption: 'Perspective calibration — align four handles to your actual wall corners',
        aspect: 4 / 3,
      },
      {
        src: '/screenshots/gallery_wall_planner_switch_layouts_compare.mp4',
        type: 'video',
        alt: 'Screen recording of the Layouts tab in Gallery Wall Planner — a user saves the current arrangement under a name, then loads a different saved layout, instantly swapping all pieces on the canvas to compare two gallery wall designs.',
        caption: 'Saved layouts — switch between arrangements in one click',
        aspect: 16 / 9,
      },
      {
        src: '/screenshots/gallery_wall_planner_piece_library_demo.mp4',
        type: 'video',
        alt: 'Screen recording of the Piece Library tab in Gallery Wall Planner — a user browses saved piece thumbnails with names and dimensions, then clicks the green "+ Add" button to place a piece from the library onto the current wall canvas.',
        caption: 'Piece library — your collection persists across every wall',
        aspect: 16 / 9,
      },
    ],
  },

  'seo-analyzer': {
    tagline: 'Free SEO audit tool that analyzes pages the way search engines actually see them.',
    paragraphs: [
      "Most free SEO checkers scrape raw HTML off the wire and call it done. That worked in 2010. Today, a huge share of web content is injected by JavaScript after the page loads — and those tools miss all of it. This SEO audit tool runs every URL through a headless browser, so it performs a complete on-page SEO analysis on the rendered DOM exactly as Googlebot sees it after JS executes. It's the difference between checking your site's source code and checking what actually loads.",
      "Once the page is rendered, the website SEO checker scores it across 30+ factors: technical SEO (HTTPS, canonical tags, hreflang, robots directives), on-page SEO (title tag and meta description length, heading structure, keyword usage, image alt text), and core performance signals. Every factor gets a numeric score, a pass/warn/fail flag, and a plain-English explanation of what to fix and why. Run a free SEO analysis on any public URL — no account, no extension, no installation.",
    ],
    features: [
      'Free SEO audit tool — analyze any public URL instantly, no login required',
      'Headless-browser rendering catches JS-injected content most SEO checkers miss',
      '30+ on-page SEO factors scored across technical, content, and performance',
      'Pass / warn / fail flags with plain-English explanations for every issue',
      'Free website SEO checker — no account, no plugin, no installation',
      'Category breakdown so you can triage technical SEO issues at a glance',
    ],
    screenshots: [
      {
        src: '/screenshots/seo_analyzer_app_homepage.png',
        type: 'image',
        alt: "SEO Analyzer home screen on a dark background. The title reads 'SEO Analyzer' with the subtitle 'Full-site SEO analysis with JavaScript rendering — crawls all pages'. A URL input field contains 'fortherecordmn.com' with a purple Scan button to the right. Home and Previous Scans tabs are visible.",
        caption: 'Paste any public URL to kick off a full SEO audit',
        aspect: 16 / 9,
        wide: true,
      },
      {
        src: '/screenshots/seo_analyzer_app_view_analysis.mp4',
        type: 'video',
        alt: 'Screen recording of the SEO Analyzer scrolling through a complete audit report — individual factor rows expand to reveal numeric scores, pass/warn/fix flags, actionable explanations, and the specific page elements that triggered each check.',
        caption: 'Every factor scores itself and tells you exactly what to fix',
        aspect: 16 / 9,
      },
      {
        src: '/screenshots/seo_analyzer_app_view_issues.png',
        type: 'image',
        alt: "SEO Analyzer results panel for fortherecordmn.com/about. A large green circle shows 94% (16 of 17 checks passed, Status 200, 593 words). Title Tag and Meta Description rows show PASS. The Keywords & Content row shows FIX and is expanded to reveal readability scores, primary keyword 'audio' flagged as absent from title, meta, H1, and URL, plus a top-keywords frequency table.",
        caption: 'Factor detail — drill into any check to see exactly what needs fixing',
        aspect: 4 / 3,
      },
    ],
  },

  'spotify-tools': {
    tagline: 'Export Spotify playlists, build from a track list, and auto-generate clean versions.',
    paragraphs: [
      "Spotify is polished but surprisingly limited the moment you try to manage your library at scale. You can't export a Spotify playlist to a text file, you can't bulk-build one from a list of songs, and there's no native way to create a clean version of a playlist for the car or the kids' room. Spotify Super User Tools fills all three gaps in one place.",
      "The Spotify playlist exporter pulls every track from any playlist into a clean, copyable song list — perfect for backups, sharing with friends outside the app, or importing into another tool. The playlist builder does the reverse: paste in a list of songs as \"Artist — Track\" lines and it finds and queues each one, so you can create a Spotify playlist from a text list in seconds. The clean playlist maker scans any playlist for explicit songs and automatically generates a non-explicit Spotify playlist, swapping each track for its clean version wherever Spotify offers one.",
    ],
    features: [
      'Export any Spotify playlist to a text list — perfect for backups and sharing',
      'Create a Spotify playlist from a text list of songs — paste and build in seconds',
      'Auto-generate a clean, non-explicit version of any Spotify playlist',
      'Works with your own playlists and any public Spotify playlist',
      'Secure Spotify OAuth login — your credentials never touch this server',
    ],
    screenshots: [
      {
        src: '/screenshots/ssut_main_screenshot_playlist_extractor_to_text.png',
        type: 'image',
        alt: "Spotify Super User Tools — Playlist Extractor view. A Spotify playlist URL is entered in the input field. Below, a success banner reads 'Successfully extracted 30 tracks!' and shows the playlist 'Birkie Weekend Vibes' with the full track list as plain text: Vagabond - Caamp, Astrovan - Mt. Joy, Stubborn Love - The Lumineers, and more.",
        caption: 'Playlist Extractor — pulls any playlist into a plain-text track list',
        aspect: 16 / 9,
        wide: true,
      },
      {
        src: '/screenshots/ssut_playlist_builder_from_list.png',
        type: 'image',
        alt: "Spotify Super User Tools — Playlist Builder view. A textarea contains a pasted list of songs: Can't Help Falling in Love - Tommy Emmanuel, Thinking Out Loud - The Piano Guys, All of Me - Simply Three, A Thousand Years - 2CELLOS, Perfect - Paul Cardall. A green 'Search Songs' button sits below.",
        caption: 'Playlist Builder — paste a song list, get a Spotify playlist',
        aspect: 16 / 9,
      },
      {
        src: '/screenshots/ssut_cleanify_song_clean_playlist.png',
        type: 'image',
        alt: "Spotify Super User Tools — Cleanify view. Shows 'Connected to Spotify' in green, a Playlist URL or ID input field, and two output mode radio options: 'Whole playlist with cleaned tracks' (selected, includes already-clean tracks plus swapped clean versions) and 'Only cleaned tracks'. A green Cleanify! button is at the bottom.",
        caption: 'Cleanify — auto-swaps explicit tracks for clean versions',
        aspect: 16 / 9,
      },
    ],
  },
}

/* ── Lightbox ────────────────────────────────────────────── */
function Lightbox({ item, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        {item.type === 'video'
          ? <video
              src={item.src}
              autoPlay loop muted playsInline
              className="lightbox-media"
            />
          : <img src={item.src} alt={item.alt} className="lightbox-media" />
        }
        {item.caption && <p className="lightbox-caption">{item.caption}</p>}
      </div>
    </div>
  )
}

/* ── Media item (image or autoplay video) ────────────────── */
function MediaItem({ shot, color, onOpen }) {
  const paddingTop = `${(1 / shot.aspect) * 100}%`
  return (
    <figure className="app-screenshot" onClick={() => onOpen(shot)}>
      <div className="app-screenshot-frame" style={{ paddingTop, '--shot-color': color }}>
        {shot.type === 'video'
          ? <video
              src={shot.src}
              autoPlay loop muted playsInline
              className="app-screenshot-media"
            />
          : <img
              src={shot.src}
              alt={shot.alt}
              className="app-screenshot-media"
              loading="lazy"
            />
        }
        <div className="app-screenshot-expand-hint" aria-hidden="true">⤢</div>
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
function AppSection({ app, onOpenLightbox }) {
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

          {/* Hero screenshot / video (full width) */}
          <div className="app-detail-hero-shot">
            <MediaItem shot={heroShot} color={app.color} onOpen={onOpenLightbox} />
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
                <MediaItem key={i} shot={shot} color={app.color} onOpen={onOpenLightbox} />
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
  const [lightboxItem, setLightboxItem] = useState(null)
  const closeLightbox = useCallback(() => setLightboxItem(null), [])

  return (
    <div className="app-readme">

      {/* Lightbox */}
      {lightboxItem && <Lightbox item={lightboxItem} onClose={closeLightbox} />}

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
        <AppSection key={app.id} app={app} onOpenLightbox={setLightboxItem} />
      ))}
    </div>
  )
}
