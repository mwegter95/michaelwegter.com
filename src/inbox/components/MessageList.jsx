import { memo, useEffect, useRef, useState } from 'react'
import Icon from './Icons'
import { groupByDay, isHighlight, labelText, senderName, timeLabel, toDate } from '../format'

const KIND_WORDS = { family: 'family', friend: 'friend', vip: 'close contact', work: 'work' }

export const MessageRow = memo(function MessageRow({ m, selected, onOpen, onAct, showUnreadDot, peopleKinds }) {
  const high = m.importance === 'high'
  const unread = !m.read
  const kind = m.personal ? (peopleKinds?.[m.from_email] || 'personal') : null
  const cls = ['ibx-row', unread && 'is-unread', high && 'is-high', m.personal && 'is-personal', selected && 'is-selected']
    .filter(Boolean).join(' ')
  return (
    <article className={cls} data-id={m.id}>
      <button type="button" className="ibx-row-main" onClick={() => onOpen(m.id)} aria-current={selected ? 'true' : undefined}>
        <span className="ibx-row-top">
          {showUnreadDot && unread && <span className="ibx-dot" aria-label="Unread" />}
          <span className="ibx-sender">{senderName(m)}</span>
          {m.message_count > 1 && <span className="ibx-thread-n" aria-label={`${m.message_count} messages`}>{m.message_count}</span>}
          {kind && <span className="ibx-kind">{KIND_WORDS[kind] || kind}</span>}
          {m.pinned && <Icon name="pin" size={12} filled className="ibx-row-pin" title="Pinned" />}
          {m.starred && <Icon name="star" size={12} filled className="ibx-row-star" title="Starred" />}
          <time dateTime={m.date}>{timeLabel(m.date)}</time>
        </span>
        <span className="ibx-subject"><span className={high ? 'ibx-mark' : undefined}>{m.subject || '(no subject)'}</span></span>
        {(m.summary || m.snippet) && <span className="ibx-summary">{m.summary || m.snippet}</span>}
        {m.labels?.length > 0 && (
          <span className="ibx-row-labels">
            {m.labels.map((l) => <span key={l} className="ibx-chip" title={l}>{labelText(l)}</span>)}
            {!m.in_inbox && m.sorted_at && <span className="ibx-filed">archived</span>}
          </span>
        )}
      </button>
      <div className="ibx-row-actions">
        <button type="button" className="ibx-icon-btn" title={m.pinned ? 'Unpin' : 'Pin to top'} aria-label={m.pinned ? 'Unpin' : 'Pin to top'}
          onClick={() => onAct([m.id], m.pinned ? 'unpin' : 'pin')}><Icon name={m.pinned ? 'pinOff' : 'pin'} /></button>
        <button type="button" className="ibx-icon-btn" title={unread ? 'Mark read' : 'Mark unread'} aria-label={unread ? 'Mark read' : 'Mark unread'}
          onClick={() => onAct([m.id], unread ? 'read' : 'unread')}><Icon name={unread ? 'read' : 'unread'} /></button>
        {m.in_inbox && (
          <button type="button" className="ibx-icon-btn" title="Archive" aria-label="Archive"
            onClick={() => onAct([m.id], 'archive')}><Icon name="archive" /></button>
        )}
      </div>
    </article>
  )
})

function LatestSort({ batch }) {
  const [open, setOpen] = useState(false)
  if (!batch?.summary) return null
  const at = toDate(batch.finished_at || batch.created_at)
  if (!at || Date.now() - at.getTime() > 36 * 3600e3) return null
  return (
    <aside className={`ibx-note${open ? ' is-open' : ''}`} aria-label="Notes from the latest sort">
      <p className="ibx-note-head">From the {timeLabel(at)} sort</p>
      <p>{batch.summary}</p>
      <button type="button" className="ibx-note-more" onClick={() => setOpen(true)}>Read all</button>
    </aside>
  )
}

const EMPTY = {
  highlights: ['Nothing needs you right now.', 'Important and personal mail shows up here after each sort.'],
  inbox: ['Gmail’s inbox is empty.', 'Inbox zero. Enjoy it.'],
  unread: ['You’ve opened everything that was sorted.', ''],
  sorted: ['Nothing has been sorted yet.', 'Sort new mail to fill this in, or import your Rollup history in Settings.'],
  pinned: ['No pinned emails.', 'Pin an email to keep it in the strip above.'],
}

export default function MessageList({ inbox, peopleKinds, onSort }) {
  const { list, view, label, query, selectedId, open, act, summary } = inbox
  const ref = useRef(null)
  const groups = groupByDay(list.items, new Date(), view === 'pinned' ? 'pinned_at' : 'date')

  useEffect(() => {
    if (!selectedId || !ref.current) return
    const safe = window.CSS?.escape ? window.CSS.escape(selectedId) : selectedId.replace(/["\\]/g, '\\$&')
    const el = ref.current.querySelector(`[data-id="${safe}"]`)
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [selectedId])

  if (list.loading) {
    return (
      <div className="ibx-list" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="ibx-skeleton" style={{ animationDelay: `${i * 80}ms` }} />)}
      </div>
    )
  }
  if (list.error) {
    return (
      <div className="ibx-list ibx-empty">
        <p className="ibx-empty-title">Couldn’t load this list.</p>
        <p>{list.error.message}</p>
        <button type="button" className="ibx-btn" onClick={() => inbox.loadList()}>Try again</button>
      </div>
    )
  }
  const [title, sub] = query ? [`No emails match “${query}”.`, 'Try a sender, a subject word, or part of the summary.']
    : label ? [`Nothing under ${label}.`, ''] : (EMPTY[view] || EMPTY.sorted)
  return (
    <div className="ibx-list" ref={ref}>
      {(view === 'highlights' || view === 'sorted') && !label && !query && <LatestSort batch={summary?.latest_batch} />}
      {!list.items.length && (
        <div className="ibx-empty">
          <p className="ibx-empty-title">{title}</p>
          {sub && <p>{sub}</p>}
          {view === 'sorted' && !label && !query && <button type="button" className="ibx-btn" onClick={onSort}>Sort new mail</button>}
        </div>
      )}
      {groups.map((g) => (
        <section key={g.key || 'none'} className="ibx-day" aria-label={g.label}>
          <h3 className="ibx-day-h">{view === 'pinned' ? `Pinned ${g.label.toLowerCase() === 'today' || g.label.toLowerCase() === 'yesterday' ? g.label.toLowerCase() : g.label}` : g.label}</h3>
          {g.items.map((m) => (
            <MessageRow key={m.id} m={m} selected={m.id === selectedId} onOpen={open} onAct={act} peopleKinds={peopleKinds}
              showUnreadDot={view !== 'sorted' || isHighlight(m)} />
          ))}
        </section>
      ))}
    </div>
  )
}
