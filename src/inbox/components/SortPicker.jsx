import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icons'
import { groupSortsByDay, plural, sortMeta, toDate } from '../format'

const PAGE = 60

/** "Sorts" button in the list header: tick one or more sorts to see only the mail they filed. */
export default function SortPicker({ api, view, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState({ items: [], loading: false, error: null, next: null, total: 0 })
  const wrap = useRef(null)
  const button = useRef(null)
  const req = useRef(0)
  const chosen = new Set(selected.map((s) => s.key))

  const load = useCallback(async (offset = 0) => {
    const n = ++req.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await api.sorts({ view, limit: PAGE, offset })
      if (n !== req.current) return
      setState((s) => ({
        items: offset ? [...s.items, ...(data.sorts || [])] : (data.sorts || []),
        loading: false, error: null, next: data.next_offset ?? null, total: data.total ?? 0,
      }))
    } catch (e) {
      if (n === req.current) setState((s) => ({ ...s, loading: false, error: e }))
    }
  }, [api, view])

  useEffect(() => { if (open) load(0) }, [open, load])
  useEffect(() => { setOpen(false) }, [view])
  useEffect(() => {
    if (!open) return undefined
    const away = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const toggle = (s) => onChange(chosen.has(s.key) ? selected.filter((x) => x.key !== s.key) : [...selected, s])
  const close = () => { setOpen(false); button.current?.focus() }
  const days = groupSortsByDay(state.items)

  return (
    <div className="ibx-sortpick" ref={wrap}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); close() } }}>
      <button ref={button} type="button" className={`ibx-sortpick-btn${selected.length ? ' is-on' : ''}`}
        aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}
        title="Show only the mail from the sorts you choose">
        <Icon name="layers" size={15} />
        <span>{selected.length ? plural(selected.length, 'sort') : 'All sorts'}</span>
        <Icon name="chevron" size={12} className="ibx-sortpick-chev" />
      </button>
      {open && (
        <div className="ibx-sortpick-pop" role="dialog" aria-label="Choose sorts">
          <div className="ibx-sortpick-head">
            <p>{view === 'recent' ? 'Sorts from this past week' : 'Every sort'}</p>
            {selected.length > 0 && <button type="button" className="ibx-sortpick-clear" onClick={() => onChange([])}>Show all</button>}
          </div>
          <div className="ibx-sortpick-list">
            {days.map((d) => (
              <section key={d.key || 'undated'} aria-label={d.label}>
                <h4>{d.label}</h4>
                {d.items.map((s) => {
                  const at = toDate(s.at)
                  const on = chosen.has(s.key)
                  return (
                    <label key={s.key} className={`ibx-sortpick-item${on ? ' is-on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle(s)} />
                      <span className="ibx-sortpick-time">{at ? at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Sorted'}</span>
                      <span className="ibx-sortpick-meta">{sortMeta({ source: s.source, count: s.count, inInbox: s.in_inbox })}</span>
                    </label>
                  )
                })}
              </section>
            ))}
            {state.loading && <p className="ibx-sortpick-note"><span className="ibx-spinner ibx-spinner--quiet" /> Loading sorts…</p>}
            {state.error && (
              <p className="ibx-sortpick-note">{state.error.message} <button type="button" className="ibx-link-btn" onClick={() => load(0)}>Try again</button></p>
            )}
            {!state.loading && !state.error && !state.items.length && (
              <p className="ibx-sortpick-note">{view === 'recent' ? 'Nothing was sorted this past week.' : 'Nothing has been sorted yet.'}</p>
            )}
            {state.next != null && !state.loading && (
              <button type="button" className="ibx-more ibx-sortpick-older" onClick={() => load(state.next)}>
                Show older sorts ({(state.total - state.items.length).toLocaleString('en-US')} more)
              </button>
            )}
          </div>
          <div className="ibx-sortpick-foot">
            <button type="button" className="ibx-btn" onClick={close}>Done</button>
          </div>
        </div>
      )}
    </div>
  )
}
