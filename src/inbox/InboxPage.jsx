import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSiteAuth } from '../auth/SiteAuth'
import SignInModal from '../components/SignInModal'
import { createApi, createLocalAi } from './api'
import { createMockApi } from './mock'
import { useInbox } from './useInbox'
import Icon from './components/Icons'
import Sidebar, { VIEWS, viewCount } from './components/Sidebar'
import MessageList from './components/MessageList'
import Reader from './components/Reader'
import SortDrawer from './components/SortDrawer'
import SettingsDrawer from './components/SettingsDrawer'
import { headingDate, labelText, senderName, timeLabel, todaySentences, waitingSentence } from './format'
import './inbox.css'

const SHORTCUTS = [
  ['j / k', 'Next / previous email'],
  ['o or Enter', 'Open the first email'],
  ['e', 'Archive'],
  ['u', 'Mark unread'],
  ['p', 'Pin or unpin'],
  ['s', 'Star or unstar'],
  ['/', 'Search'],
  ['1–5', 'Highlights, Inbox, Unread, All sorted, Pinned'],
  ['n', 'Sort new mail'],
  ['Esc', 'Close'],
]

function Gate({ onSignIn, expired }) {
  return (
    <div className="ibx ibx-gate">
      <div className="ibx-gate-card">
        <h1>Inbox</h1>
        <p>{expired ? 'Your session ended. Sign in again to open your inbox.' : 'This is Michael’s private inbox. Sign in as the owner to open it.'}</p>
        <div className="ibx-btn-row ibx-btn-row--start">
          <button type="button" className="ibx-btn ibx-btn--primary" onClick={onSignIn}>Sign in</button>
          <Link className="ibx-btn" to="/apps/inbox?demo=1">Try it with sample mail</Link>
        </div>
      </div>
    </div>
  )
}

function PinRail({ pins, onOpen, onUnpin, selectedId }) {
  if (!pins?.length) return null
  return (
    <div className="ibx-pins" aria-label="Pinned emails">
      <span className="ibx-pins-label"><Icon name="pin" size={13} filled /> Pinned</span>
      <ul>
        {pins.map((p) => (
          <li key={p.id} className={`ibx-pin${p.id === selectedId ? ' is-selected' : ''}${p.importance === 'high' ? ' is-high' : ''}${p.personal ? ' is-personal' : ''}`}>
            <button type="button" className="ibx-pin-open" onClick={() => onOpen(p.id)} title={`${senderName(p)}: ${p.subject}`}>
              <span className="ibx-pin-from">{senderName(p)}</span>
              <span className="ibx-pin-subject">{p.subject || '(no subject)'}</span>
              <time dateTime={p.date}>{timeLabel(p.date)}</time>
            </button>
            <button type="button" className="ibx-pin-x" aria-label={`Unpin ${p.subject}`} onClick={() => onUnpin(p.id)}><Icon name="close" size={11} /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="ibx-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`ibx-toast${t.error ? ' is-error' : ''}`}>
          <span>{t.text}</span>
          {t.action && <button type="button" onClick={() => { t.action.run(); onDismiss(t.id) }}>{t.action.label}</button>}
          <button type="button" className="ibx-toast-x" aria-label="Dismiss" onClick={() => onDismiss(t.id)}><Icon name="close" size={11} /></button>
        </div>
      ))}
    </div>
  )
}

export function Inbox({ api, localAi, demo }) {
  const inbox = useInbox(api)
  const [signIn, setSignIn] = useState(false)
  const { summary, gmail, view, label, query, list, selected, selectedId, threads, open, act, close } = inbox
  const [drawer, setDrawer] = useState(null)       // 'sort' | 'settings' | null
  const [help, setHelp] = useState(false)
  const [search, setSearch] = useState('')
  const [settings, setSettings] = useState(null)
  const [labels, setLabels] = useState([])
  const searchRef = useRef(null)

  useEffect(() => { api.settings().then(setSettings).catch(() => {}) }, [api])
  useEffect(() => { api.labels().then((d) => setLabels(d.labels || [])).catch(() => {}) }, [api, summary?.sorted_total])
  useEffect(() => { setSearch(query) }, [query])
  useEffect(() => {
    const t = setTimeout(() => { if (search !== query) inbox.setQuery(search.trim()) }, 300)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const peopleKinds = useMemo(() => Object.fromEntries((settings?.people || []).filter((p) => p.match.includes('@') && !p.match.startsWith('@')).map((p) => [p.match, p.kind === 'vip' ? 'close contact' : p.kind])), [settings])
  const blockImages = settings?.block_images ?? summary?.settings?.block_images ?? false

  // Stable across renders so the sort drawer's polling timer isn't reset by unrelated updates.
  const inboxRef = useRef(inbox)
  inboxRef.current = inbox
  const onChanged = useCallback(() => {
    const i = inboxRef.current
    i.loadSummary(); i.loadList({ quiet: true }); i.loadGmail(true)
  }, [])

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        if (e.key === 'Escape') e.target.blur()
        return
      }
      if (drawer) return
      const items = list.items
      const i = items.findIndex((m) => m.id === selectedId)
      const go = (j) => { const m = items[Math.max(0, Math.min(items.length - 1, j))]; if (m) open(m.id) }
      switch (e.key) {
        case 'j': go(i + 1); break
        case 'k': go(i < 0 ? 0 : i - 1); break
        case 'o': case 'Enter': if (!selected && items.length) go(0); else return; break
        case 'e': if (selected?.in_inbox) { act([selected.id], 'archive'); go(i + 1 < items.length ? i + 1 : i - 1) } break
        case 'u': if (selected) { act([selected.id], 'unread'); close() } break
        case 'p': if (selected) act([selected.id], selected.pinned ? 'unpin' : 'pin'); break
        case 's': if (selected) act([selected.id], selected.starred ? 'unstar' : 'star'); break
        case '/': searchRef.current?.focus(); break
        case 'n': setDrawer('sort'); break
        case '?': setHelp((h) => !h); break
        case 'Escape': if (help) setHelp(false); else close(); break
        default: {
          const n = Number(e.key)
          if (n >= 1 && n <= VIEWS.length) inbox.chooseView(VIEWS[n - 1].id)
          else return
        }
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [list.items, selectedId, selected, open, act, close, drawer, help, inbox])

  if (!demo && [401, 403].includes(inbox.summaryError?.status)) {
    return (
      <>
        <Gate onSignIn={() => setSignIn(true)} expired />
        <SignInModal open={signIn} onClose={() => setSignIn(false)} />
      </>
    )
  }

  const [first, second] = todaySentences(summary)
  const waiting = gmail?.waiting
  const viewName = label ? labelText(label) : VIEWS.find((v) => v.id === view)?.label
  const sortLabel = waiting ? `Sort ${waiting.toLocaleString('en-US')}${gmail?.waiting_capped ? '+' : ''} new` : 'Sort new mail'
  const running = summary?.running_batch
  const reviewWaiting = summary?.latest_batch?.status === 'review'

  return (
    <div className={`ibx${selected ? ' has-selection' : ''}`}>
      {demo && (
        <p className="ibx-demo-bar">You’re looking at sample mail. Nothing here is real, and nothing reaches Gmail. <Link to="/apps/inbox">Leave the demo</Link></p>
      )}
      <header className="ibx-top">
        <div className="ibx-today">
          <h1>{headingDate()}</h1>
          <p>{summary ? <>{first} <span className={summary.highlights?.unread ? 'ibx-today-hot' : undefined}>{second}</span></> : inbox.summaryError ? inbox.summaryError.message : ' '}</p>
        </div>
        <div className="ibx-top-actions">
          {gmail?.waiting != null && !gmail?.error && <p className="ibx-waiting">{waitingSentence(gmail)}</p>}
          <button type="button" className={`ibx-btn ibx-btn--primary${running ? ' is-busy' : ''}`} onClick={() => setDrawer('sort')}>
            {running ? <span className="ibx-spinner" /> : <Icon name="sort" />}
            {running ? 'Sorting…' : reviewWaiting ? 'Review the sort' : sortLabel}
          </button>
          <button type="button" className="ibx-icon-btn ibx-icon-btn--framed" onClick={inbox.refreshAll} aria-label="Refresh" title="Refresh"><Icon name="refresh" /></button>
          <button type="button" className="ibx-icon-btn ibx-icon-btn--framed" onClick={() => setDrawer('settings')} aria-label="Settings" title="Settings"><Icon name="settings" /></button>
        </div>
      </header>

      {gmail?.error && (
        <div className="ibx-problem" role="alert">
          <p><strong>{gmail.code === 'config' ? 'Gmail isn’t connected yet.' : 'Gmail didn’t answer.'}</strong> {gmail.error}</p>
          <button type="button" className="ibx-btn" onClick={() => inbox.loadGmail(true)}>Try again</button>
        </div>
      )}

      <PinRail pins={summary?.pins} selectedId={selectedId} onOpen={open} onUnpin={(id) => act([id], 'unpin')} />

      <div className="ibx-body">
        <Sidebar summary={summary} view={view} label={label} onView={inbox.chooseView} onLabel={inbox.chooseLabel} onShortcuts={() => setHelp(true)} />

        <div className="ibx-col">
          <div className="ibx-switch" role="tablist" aria-label="Mailboxes">
            {VIEWS.map((v) => {
              const n = viewCount(v.id, summary)
              return (
                <button key={v.id} type="button" role="tab" aria-selected={view === v.id && !label} className={view === v.id && !label ? 'is-current' : ''} onClick={() => inbox.chooseView(v.id)}>
                  {v.label}{n ? <span className="ibx-count">{n}</span> : null}
                </button>
              )
            })}
            {summary?.labels?.length > 0 && (
              <select className="ibx-select ibx-select--tiny" value={label} onChange={(e) => (e.target.value ? inbox.chooseLabel(e.target.value) : inbox.chooseView('sorted'))} aria-label="Label">
                <option value="">Labels</option>
                {summary.labels.map((l) => <option key={l.name} value={l.name}>{labelText(l.name)} ({l.count})</option>)}
              </select>
            )}
          </div>
          <div className="ibx-col-head">
            <h2>{viewName}{label && <button type="button" className="ibx-link-btn" onClick={() => inbox.chooseView('highlights')}>Clear</button>}</h2>
            <label className="ibx-search">
              <Icon name="search" size={14} />
              <input ref={searchRef} type="search" placeholder="Search mail" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search mail" />
            </label>
            {list.refreshing && <span className="ibx-spinner ibx-spinner--quiet" aria-label="Refreshing" />}
          </div>
          <MessageList inbox={inbox} peopleKinds={peopleKinds} onSort={() => setDrawer('sort')} />
        </div>

        <Reader m={selected} threadState={selected ? threads[selected.id] : null} labels={labels}
          blockImages={blockImages} kind={selected ? peopleKinds[selected.from_email] : null}
          onAct={(ids, action, opts) => act(ids, action, opts)} onClose={close} onRetry={() => inbox.loadThread(selected.id, true)} />
      </div>

      {help && (
        <div className="ibx-help" role="dialog" aria-label="Keyboard shortcuts" onClick={() => setHelp(false)}>
          <dl onClick={(e) => e.stopPropagation()}>
            {SHORTCUTS.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      )}

      {drawer === 'sort' && (
        <SortDrawer api={api} localAi={localAi} summary={summary} gmail={gmail} labels={labels} onClose={() => setDrawer(null)} onChanged={onChanged}
          onShowHighlights={() => { setDrawer(null); inbox.chooseView('highlights') }} />
      )}
      {drawer === 'settings' && (
        <SettingsDrawer api={api} localAi={localAi} onClose={() => setDrawer(null)} onSaved={(d) => { if (d) setSettings(d); onChanged() }} />
      )}
      <Toasts toasts={inbox.toasts} onDismiss={inbox.dismissToast} />
    </div>
  )
}

export default function InboxPage() {
  const { token, isOwner } = useSiteAuth()
  const location = useLocation()
  const demo = new URLSearchParams(location.search).get('demo') === '1'
  const [signIn, setSignIn] = useState(false)
  const api = useMemo(() => (demo ? createMockApi() : token ? createApi(token) : null), [demo, token])
  const localAi = useMemo(() => (demo ? api?.localAi : token ? createLocalAi(token) : null), [demo, token, api])

  useEffect(() => {
    document.title = 'Inbox — Michael Wegter'
    document.documentElement.classList.add('ibx-page')
    return () => { document.title = 'Michael Wegter'; document.documentElement.classList.remove('ibx-page') }
  }, [])

  if (!demo && (!isOwner || !api)) {
    return (
      <>
        <Gate onSignIn={() => setSignIn(true)} expired={false} />
        <SignInModal open={signIn} onClose={() => setSignIn(false)} />
      </>
    )
  }
  return <Inbox key={demo ? 'demo' : 'live'} api={api} localAi={localAi} demo={demo} />
}
