import { useState } from 'react'
import Icon from './Icons'
import DayChart from './DayChart'
import { labelText } from '../format'

export const VIEWS = [
  { id: 'highlights', label: 'Highlights', hint: 'Important and personal mail' },
  { id: 'inbox', label: 'Inbox', hint: 'What is in Gmail’s inbox right now' },
  { id: 'unread', label: 'Unread', hint: 'Sorted mail you haven’t opened here' },
  { id: 'sorted', label: 'All sorted', hint: 'Everything triage has filed' },
  { id: 'pinned', label: 'Pinned', hint: 'Emails you pinned' },
]

export function viewCount(id, summary) {
  if (!summary) return null
  if (id === 'highlights') return summary.highlights?.unread || null
  if (id === 'inbox') return summary.gmail?.inbox_unread ?? null
  if (id === 'unread') return summary.unread || null
  if (id === 'pinned') return summary.pins?.length || null
  return null
}

const LABELS_SHOWN = 8

export default function Sidebar({ summary, view, label, onView, onLabel, onShortcuts }) {
  const [allLabels, setAllLabels] = useState(false)
  const labels = summary?.labels || []
  const shown = allLabels ? labels : labels.slice(0, LABELS_SHOWN)
  return (
    <nav className="ibx-side" aria-label="Mailboxes">
      <ul className="ibx-views">
        {VIEWS.map((v) => {
          const n = viewCount(v.id, summary)
          const current = view === v.id && !label
          return (
            <li key={v.id}>
              <button type="button" className={`ibx-view${current ? ' is-current' : ''}`} aria-current={current ? 'page' : undefined}
                title={v.hint} onClick={() => onView(v.id)}>
                <span>{v.label}</span>
                {n ? <span className={`ibx-count${v.id === 'highlights' ? ' ibx-count--hot' : ''}`}>{n}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>

      <DayChart days={summary?.days} />

      {labels.length > 0 && (
        <section className="ibx-labels" aria-labelledby="ibx-labels-h">
          <h2 id="ibx-labels-h">Labels</h2>
          <ul>
            {shown.map((l) => (
              <li key={l.name}>
                <button type="button" className={`ibx-label-link${label === l.name ? ' is-current' : ''}`}
                  aria-current={label === l.name ? 'page' : undefined} title={`${l.name}: ${l.count} sorted, ${l.unread} unread`} onClick={() => onLabel(l.name)}>
                  <Icon name="tag" size={13} />
                  <span className="ibx-label-name">{labelText(l.name)}</span>
                  {l.unread > 0 && <span className="ibx-label-n"><b>{l.unread}</b><span className="ibx-sr"> unread</span></span>}
                </button>
              </li>
            ))}
          </ul>
          {labels.length > LABELS_SHOWN && (
            <button type="button" className="ibx-more" onClick={() => setAllLabels((x) => !x)}>
              {allLabels ? 'Show fewer' : `Show ${labels.length - LABELS_SHOWN} more`}
            </button>
          )}
        </section>
      )}

      {onShortcuts && (
        <button type="button" className="ibx-more ibx-shortcuts-link" onClick={onShortcuts}>
          <Icon name="keyboard" size={14} /> Keyboard shortcuts
        </button>
      )}

    </nav>
  )
}
