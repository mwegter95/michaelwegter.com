import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { workSamples, allWorkSamples, availableTagSections } from '../data/workSamples'
import { useSiteAuth } from '../auth/SiteAuth'

/**
 * WorkSamples - gallery of client-proposal demos.
 *
 * Mirrors the Apps page but reads from the separate workSamples registry. Each
 * card links to /work-samples/:slug, which AppFrame renders as a full-viewport
 * iframe of the same-origin demo under /demos/<slug>/.
 *
 * A tag filter sits in a sticky left sidebar (its own scroll when long): tags are
 * grouped into sections, every tag is selected by default (so all samples show),
 * and a sample stays visible when it has at least one selected tag. Section
 * headers toggle a whole group; "Clear selection" empties the set and "Select all"
 * restores it. On mobile the sidebar collapses into a "Tags" hamburger that opens
 * the filter as a left drawer, closed by its ✕ or by tapping the backdrop.
 *
 * Hidden samples are private: they only appear when the owner is signed in.
 */
export default function WorkSamples() {
  const { isOwner } = useSiteAuth()
  const list = isOwner ? allWorkSamples : workSamples

  const sections = useMemo(() => availableTagSections(list), [list])
  const allTags = useMemo(() => sections.flatMap((section) => section.tags), [sections])
  const [selected, setSelected] = useState(() => new Set(allTags))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const closeDrawer = () => setDrawerOpen(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const toggleTag = (tag) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  const toggleSection = (sectionTags) => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allOn = sectionTags.every((tag) => next.has(tag))
      sectionTags.forEach((tag) => (allOn ? next.delete(tag) : next.add(tag)))
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())
  const selectAll = () => setSelected(new Set(allTags))

  const filtered = useMemo(
    () =>
      list.filter((s) => {
        const tags = s.tags || []
        if (tags.length === 0) return true
        return tags.some((tag) => selected.has(tag))
      }),
    [list, selected],
  )

  const allSelected = selected.size === allTags.length
  const noneSelected = selected.size === 0

  return (
    <section className="mac-section mac-section-full" style={{ paddingTop: '72px', paddingBottom: '0' }}>
      <div className="container ws-page" style={{ paddingTop: '0', paddingBottom: '40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span className="label" style={{ display: 'block', marginBottom: '12px' }}>
            Client Work
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>Work Samples</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '520px' }}>
            Real, working demos built to answer real project briefs. Click any one
            to open and use it yourself.
          </p>
          {isOwner && (
            <p style={{ marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
              Owner view — private samples are visible to you only.
            </p>
          )}
        </div>

        <div className="ws-layout">
          <div
            className={`ws-backdrop${drawerOpen ? ' open' : ''}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {sections.length > 0 && (
            <aside className={`ws-sidebar${drawerOpen ? ' open' : ''}`} aria-label="Tag filters">
              <div className="ws-filter">
                <div className="ws-filter-head">
                  <span className="ws-filter-title">Filter by tag</span>
                  <span className="ws-filter-count">{filtered.length} of {list.length}</span>
                  <button
                    type="button"
                    className="ws-drawer-close"
                    onClick={closeDrawer}
                    aria-label="Close tag filters"
                  >
                    ✕
                  </button>
                </div>
                <div className="ws-filter-actions">
                  <button type="button" onClick={selectAll} disabled={allSelected} className="ws-action">
                    Select all
                  </button>
                  <button type="button" onClick={clearSelection} disabled={noneSelected} className="ws-action">
                    Clear selection
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sections.map((section) => {
                const sectionOn = section.tags.every((tag) => selected.has(tag))
                return (
                  <div key={section.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.tags)}
                      className={`ws-section${sectionOn ? ' active' : ''}`}
                      title={sectionOn ? `Turn off all ${section.label} tags` : `Turn on all ${section.label} tags`}
                    >
                      {section.label}
                    </button>
                    {section.tags.map((tag) => {
                      const on = selected.has(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`ws-chip${on ? ' active' : ''}`}
                          aria-pressed={on}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                )
                  })}
                </div>
              </div>
            </aside>
          )}

          <div className="ws-main">
            {sections.length > 0 && (
              <button
                type="button"
                className="ws-hamburger ws-action"
                onClick={() => setDrawerOpen(true)}
                aria-expanded={drawerOpen}
              >
                <span className="ws-hamburger-icon" aria-hidden="true">☰</span> Tags
              </button>
            )}

            {filtered.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-default)',
            padding: '32px',
            textAlign: 'center',
          }}>
            {noneSelected
              ? 'No tags selected. Pick a tag or "Select all" to see work samples.'
              : 'No work samples match the selected tags.'}
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map((s) => (
              <Link
                key={s.id}
                to={`/work-samples/${s.slug}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderTop: `3px solid ${s.color}`,
                  padding: '22px',
                  transition: 'background 0.2s, transform 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'none' }}
              >
                {s.hidden && (
                  <span title="Private — visible to you only" style={{
                    position: 'absolute', top: '14px', right: '14px',
                    fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '2px 6px',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'var(--bg-card)', zIndex: 1,
                  }}>
                    🔒 Private
                  </span>
                )}
                {s.screenshot && (
                  <div style={{
                    margin: '-22px -22px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-root)',
                    aspectRatio: '16 / 9',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={s.screenshot}
                      alt={`${s.title} screenshot`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '26px', lineHeight: 1 }}>{s.icon}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: s.color,
                  }}>{s.category}</span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}>{s.title}</h2>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}>{s.description}</p>
                {s.tags && s.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {s.tags.map((tag) => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.04em',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '4px',
                        padding: '2px 7px',
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
                {s.client && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px',
                  }}>
                    {s.client}{s.date ? ` · ${s.date}` : ''}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </section>
  )
}
