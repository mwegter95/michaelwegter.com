import { useEffect, useRef, useState } from 'react'
import Icon from './Icons'
import EmailFrame from './EmailFrame'
import { formatBytes, fullDate, initials, labelText, senderName } from '../format'

function gmailLink(m, thread) {
  return thread?.permalink || `https://mail.google.com/mail/u/0/#all/${encodeURIComponent(m.id)}`
}

function LabelMenu({ m, labels, onAct, onClose }) {
  const [text, setText] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey, true) }
  }, [onClose])
  const current = new Set(m.labels || [])
  const match = text.trim().toLowerCase()
  const options = labels.filter((l) => !match || l.toLowerCase().includes(match)).slice(0, 40)
  const toggle = (l) => onAct([m.id], current.has(l) ? 'remove_labels' : 'add_labels', { labels: [l] })
  return (
    <div className="ibx-menu" ref={ref} role="dialog" aria-label="Labels">
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { toggle(text.trim()); setText('') } }}>
        <input autoFocus className="ibx-input" placeholder="Find or create a label" value={text} onChange={(e) => setText(e.target.value)} />
      </form>
      <ul>
        {options.map((l) => (
          <li key={l}>
            <button type="button" className={`ibx-menu-item${current.has(l) ? ' is-on' : ''}`} onClick={() => toggle(l)} aria-pressed={current.has(l)}>
              <span className="ibx-menu-check">{current.has(l) && <Icon name="check" size={13} />}</span>
              <span title={l}>{l}</span>
            </button>
          </li>
        ))}
        {match && !labels.some((l) => l.toLowerCase() === match) && (
          <li><button type="button" className="ibx-menu-item" onClick={() => { toggle(text.trim()); setText('') }}>
            <span className="ibx-menu-check"><Icon name="tag" size={13} /></span>Create “{text.trim()}”
          </button></li>
        )}
      </ul>
    </div>
  )
}

function Message({ msg, expanded, onToggle, blockImages, single }) {
  if (!expanded) {
    return (
      <button type="button" className="ibx-collapsed" onClick={onToggle}>
        <span className="ibx-collapsed-from">{(msg.from || '').replace(/<.*>/, '').trim() || msg.from}</span>
        <span className="ibx-collapsed-text">{(msg.plain || '').replace(/\s+/g, ' ').slice(0, 140)}</span>
        <time>{fullDate(msg.date)}</time>
      </button>
    )
  }
  return (
    <div className="ibx-msg">
      {!single && (
        <button type="button" className="ibx-msg-head" onClick={onToggle}>
          <strong>{(msg.from || '').replace(/<.*>/, '').trim() || msg.from}</strong>
          <time>{fullDate(msg.date)}</time>
        </button>
      )}
      <EmailFrame message={msg} blockImages={blockImages} />
      {msg.htmlTruncated && <p className="ibx-paper-note">This email is very long. Open it in Gmail to see the rest.</p>}
      {msg.attachments?.length > 0 && (
        <ul className="ibx-attachments" aria-label="Attachments">
          {msg.attachments.map((a, i) => (
            <li key={i}><Icon name="clip" size={13} /><span>{a.name}</span><small>{formatBytes(a.size)}</small></li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Reader({ m, threadState, labels, blockImages, kind, onAct, onClose, onRetry }) {
  const [menu, setMenu] = useState(false)
  const [expanded, setExpanded] = useState({})
  const sheetRef = useRef(null)
  useEffect(() => { setExpanded({}); setMenu(false); sheetRef.current?.scrollTo?.(0, 0) }, [m?.id])

  if (!m) {
    return (
      <div className="ibx-reader ibx-reader--empty">
        <div className="ibx-reader-hint">
          <p className="ibx-empty-title">Pick an email to read it here.</p>
          <p>Use <kbd>j</kbd> and <kbd>k</kbd> to move, <kbd>o</kbd> to open, <kbd>e</kbd> to archive, <kbd>p</kbd> to pin. Press <kbd>?</kbd> for all shortcuts.</p>
        </div>
      </div>
    )
  }
  const thread = threadState?.data
  const messages = thread?.messages || []
  const high = m.importance === 'high'
  const last = messages.length - 1
  const lastMsg = messages[last]
  const toLine = lastMsg?.to ? lastMsg.to.replace(/<[^>]+>/g, '').replace(/\s+,/g, ',').trim() : ''

  return (
    <div className="ibx-reader" aria-label="Email">
      <div className="ibx-toolbar" role="toolbar" aria-label="Email actions">
        <button type="button" className="ibx-tool ibx-tool--back" onClick={onClose}><Icon name="back" /><span>Back</span></button>
        {m.in_inbox
          ? <button type="button" className="ibx-tool" onClick={() => { onAct([m.id], 'archive'); onClose() }}><Icon name="archive" /><span>Archive</span></button>
          : <button type="button" className="ibx-tool" onClick={() => onAct([m.id], 'inbox')}><Icon name="inbox" /><span>Move to inbox</span></button>}
        <button type="button" className="ibx-tool" onClick={() => { onAct([m.id], 'unread'); onClose() }}><Icon name="unread" /><span>Mark unread</span></button>
        <button type="button" className={`ibx-tool ibx-tool--pin${m.pinned ? ' is-on' : ''}`} aria-pressed={m.pinned} onClick={() => onAct([m.id], m.pinned ? 'unpin' : 'pin')}>
          <Icon name="pin" filled={m.pinned} /><span>{m.pinned ? 'Pinned' : 'Pin'}</span></button>
        <button type="button" className={`ibx-tool ibx-tool--star${m.starred ? ' is-on' : ''}`} aria-pressed={m.starred} onClick={() => onAct([m.id], m.starred ? 'unstar' : 'star')}>
          <Icon name="star" filled={m.starred} /><span>{m.starred ? 'Starred' : 'Star'}</span></button>
        <span className="ibx-tool-wrap">
          <button type="button" className="ibx-tool" aria-expanded={menu} onClick={() => setMenu((x) => !x)}><Icon name="tag" /><span>Label</span><Icon name="chevron" size={12} /></button>
          {menu && <LabelMenu m={m} labels={labels} onAct={onAct} onClose={() => setMenu(false)} />}
        </span>
        <span className="ibx-tool-spacer" />
        <a className="ibx-tool" href={gmailLink(m, thread)} target="_blank" rel="noopener noreferrer"><Icon name="external" /><span>Open in Gmail</span></a>
        <button type="button" className="ibx-tool ibx-tool--danger" onClick={() => { onAct([m.id], 'trash'); onClose() }} aria-label="Move to trash" title="Move to trash"><Icon name="trash" /></button>
      </div>

      <div className="ibx-sheet-scroll" ref={sheetRef}>
        <article className="ibx-sheet">
          <header className="ibx-sheet-head">
            <h1 className="ibx-sheet-subject"><span className={high ? 'ibx-mark' : undefined}>{m.subject || '(no subject)'}</span></h1>
            <div className="ibx-sheet-meta">
              <span className={`ibx-avatar${m.personal ? ' is-personal' : ''}`} aria-hidden="true">{initials(senderName(m))}</span>
              <div className="ibx-sheet-from">
                <p><strong>{senderName(m)}</strong> {m.from_email && m.from_email !== m.from_name && <span className="ibx-addr">{m.from_email}</span>}
                  {m.personal && <span className="ibx-kind ibx-kind--paper">{kind || 'personal'}</span>}</p>
                {toLine && <p className="ibx-to">to {toLine}</p>}
              </div>
              <time dateTime={m.date}>{fullDate(m.date)}</time>
            </div>
            {m.labels?.length > 0 && (
              <p className="ibx-sheet-labels">{m.labels.map((l) => <span key={l} className="ibx-chip ibx-chip--paper" title={l}>{labelText(l)}</span>)}</p>
            )}
          </header>

          {m.summary && (
            <aside className="ibx-gist">
              <p className="ibx-gist-head">Triage summary</p>
              <p>{m.summary}</p>
            </aside>
          )}

          {threadState?.loading && !thread && (
            <div className="ibx-paper-loading" aria-busy="true" aria-label="Loading email">
              <span /><span /><span /><span />
            </div>
          )}
          {threadState?.error && !thread && (
            <div className="ibx-paper-error">
              <p><strong>Couldn’t open this email.</strong> {threadState.error.message}</p>
              <p>
                <button type="button" className="ibx-btn ibx-btn--paper" onClick={onRetry}>Try again</button>{' '}
                <a className="ibx-btn ibx-btn--paper" href={gmailLink(m)} target="_blank" rel="noopener noreferrer">Open in Gmail</a>
              </p>
            </div>
          )}
          {thread?.stale && <p className="ibx-paper-note">Showing a saved copy. Gmail couldn’t be reached just now.</p>}

          {messages.map((msg, i) => (
            <Message key={msg.id || i} msg={msg} single={messages.length === 1} blockImages={blockImages}
              expanded={expanded[i] ?? (i === last)}
              onToggle={() => setExpanded((x) => ({ ...x, [i]: !(x[i] ?? (i === last)) }))} />
          ))}
        </article>
      </div>
    </div>
  )
}
