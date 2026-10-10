import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Drawer from './Drawer'
import Icon from './Icons'
import { batchSentence, dayLabel, dayKey, labelText, plural, SOURCE_NAMES, toDate, waitingSentence } from '../format'

const ACTIVE = new Set(['running', 'applying'])
const SIZES = [10, 25, 50, 100]

async function copyLater(textPromise) {
  // ClipboardItem with a promise keeps the click's permission across the fetch (Safari needs this).
  if (window.ClipboardItem && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new window.ClipboardItem({
        'text/plain': textPromise.then((t) => new Blob([t], { type: 'text/plain' })),
      })])
      return true
    } catch { /* fall through */ }
  }
  try {
    await navigator.clipboard.writeText(await textPromise)
    return true
  } catch {
    return false
  }
}

function when(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return `${dayLabel(dayKey(d))} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

function Steps({ batch }) {
  const steps = [
    { key: 'read', text: 'Read unread email from Gmail' },
    { key: 'sort', text: batch.source === 'ai' ? 'Sort it with AI' : 'Check the pasted JSON' },
    { key: 'apply', text: 'Apply labels, read and archive in Gmail' },
  ]
  const s = (batch.step || '').toLowerCase()
  const at = batch.status === 'applying' || s.startsWith('applying') ? 2 : s.startsWith('sorting') ? 1 : batch.source === 'ai' ? 0 : 2
  return (
    <ol className="ibx-steps" aria-live="polite">
      {steps.map((st, i) => (
        <li key={st.key} className={i < at ? 'is-done' : i === at ? 'is-now' : ''}>
          <span className="ibx-step-mark">{i < at ? <Icon name="check" size={12} /> : i === at ? <span className="ibx-spinner" /> : null}</span>
          <span>{i === at && batch.step ? batch.step : st.text}</span>
        </li>
      ))}
    </ol>
  )
}

function ReviewRow({ a, include, onInclude, onChange, labels }) {
  const [adding, setAdding] = useState('')
  return (
    <li className={`ibx-review-row${include ? '' : ' is-skipped'}${a.importance === 'high' ? ' is-high' : ''}${a.personal ? ' is-personal' : ''}`}>
      <label className="ibx-review-include">
        <input type="checkbox" checked={include} onChange={(e) => onInclude(e.target.checked)} />
        <span className="ibx-sr">Include this email</span>
      </label>
      <div className="ibx-review-main">
        <p className="ibx-review-from">{(a.from || '').replace(/<.*>/, '').trim() || a.from}{a.personal && <span className="ibx-kind">personal</span>}</p>
        <p className="ibx-review-subject"><span className={a.importance === 'high' ? 'ibx-mark' : undefined}>{a.subject}</span></p>
        {a.summary && <p className="ibx-review-summary">{a.summary}</p>}
        <div className="ibx-review-controls">
          <span className="ibx-review-labels">
            {a.labels.map((l) => (
              <span key={l} className="ibx-chip ibx-chip--edit" title={l}>{labelText(l)}
                <button type="button" aria-label={`Remove ${l}`} onClick={() => onChange({ labels: a.labels.filter((x) => x !== l) })}><Icon name="close" size={10} /></button>
              </span>
            ))}
            <form onSubmit={(e) => { e.preventDefault(); const v = adding.trim(); if (v && !a.labels.includes(v)) onChange({ labels: [...a.labels, v] }); setAdding('') }}>
              <input className="ibx-input ibx-input--tiny" list="ibx-label-options" placeholder="Add label" value={adding} onChange={(e) => setAdding(e.target.value)} aria-label="Add a label" />
            </form>
          </span>
          <select className="ibx-select ibx-select--tiny" value={a.importance || 'low'} onChange={(e) => onChange({ importance: e.target.value })} aria-label="Importance">
            <option value="high">Important</option>
            <option value="medium">Worth knowing</option>
            <option value="low">Low</option>
          </select>
          <label className="ibx-toggle-tiny">
            <input type="checkbox" checked={!a.archive_ok} onChange={(e) => onChange({ archive_ok: !e.target.checked })} />
            Keep in inbox
          </label>
        </div>
      </div>
    </li>
  )
}

function Review({ batch, labels, onApply, onDiscard, busy }) {
  const [rows, setRows] = useState(() => batch.proposal?.actions || [])
  const [skip, setSkip] = useState(() => new Set())
  const counts = useMemo(() => {
    const kept = rows.filter((r) => !skip.has(r.id))
    return { n: kept.length, archive: kept.filter((r) => r.archive_ok).length, high: kept.filter((r) => r.importance === 'high').length }
  }, [rows, skip])
  return (
    <div className="ibx-review">
      {batch.summary && <aside className="ibx-note"><p className="ibx-note-head">What the AI saw</p><p>{batch.summary}</p></aside>}
      <p className="ibx-muted">Nothing has changed in Gmail yet. Adjust anything that looks off, then apply.</p>
      <datalist id="ibx-label-options">{labels.map((l) => <option key={l} value={l} />)}</datalist>
      <ul className="ibx-review-list">
        {rows.map((a) => (
          <ReviewRow key={a.id} a={a} labels={labels} include={!skip.has(a.id)}
            onInclude={(on) => setSkip((s) => { const n = new Set(s); on ? n.delete(a.id) : n.add(a.id); return n })}
            onChange={(c) => setRows((rs) => rs.map((r) => (r.id === a.id ? { ...r, ...c } : r)))} />
        ))}
      </ul>
      <div className="ibx-review-foot">
        <p>{plural(counts.n, 'email')}: {counts.archive} archived, {counts.high} important. Skipped emails stay unread for next time.</p>
        <div className="ibx-btn-row">
          <button type="button" className="ibx-btn" onClick={onDiscard} disabled={busy}>Discard</button>
          <button type="button" className="ibx-btn ibx-btn--primary" disabled={busy || !counts.n}
            onClick={() => onApply({ actions: rows, skip: [...skip] })}>Apply to {plural(counts.n, 'email')}</button>
        </div>
      </div>
    </div>
  )
}

export default function SortDrawer({ api, summary, gmail, labels, onClose, onChanged, onShowHighlights }) {
  const [mode, setMode] = useState('ai')
  const [size, setSize] = useState(summary?.settings?.batch_size || 50)
  const [review, setReview] = useState(summary?.settings?.review_first ?? true)
  const [batch, setBatch] = useState(summary?.running_batch || null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(null)   // {count, text, ok}
  const [pasted, setPasted] = useState('')
  const timer = useRef(null)

  const loadHistory = useCallback(() => api.batches().then((d) => setHistory(d.batches || [])).catch(() => {}), [api])
  useEffect(() => { loadHistory() }, [loadHistory])
  useEffect(() => {
    // Pick up a review left from earlier.
    if (!batch && summary?.latest_batch?.status === 'review') {
      api.batch(summary.latest_batch.id).then((d) => setBatch(d.batch)).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll a batch while it runs.
  useEffect(() => {
    clearTimeout(timer.current)
    if (!batch || !ACTIVE.has(batch.status)) return
    timer.current = setTimeout(async () => {
      try {
        setBatch((await api.batch(batch.id)).batch)
      } catch (e) {
        setError(e.message)
      }
    }, 1500)
    return () => clearTimeout(timer.current)
  }, [batch, api])

  // Whenever a batch settles (however quickly), refresh the dashboard behind the drawer.
  const settled = useRef(null)
  useEffect(() => {
    const key = batch ? `${batch.id}:${batch.status}` : null
    if (key && settled.current !== null && key !== settled.current && !ACTIVE.has(batch.status)) {
      onChanged()
      loadHistory()
    }
    settled.current = key ?? ''
  }, [batch?.id, batch?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError(null); setBusy(true)
    try {
      const d = await api.runTriage({ limit: size, review })
      setBatch(d.batch)
    } catch (e) {
      setError(e.message)
      if (e.body?.batch_id) api.batch(e.body.batch_id).then((d) => setBatch(d.batch)).catch(() => {})
    } finally { setBusy(false) }
  }
  const copyForChatGPT = async () => {
    setError(null); setBusy(true); setCopied(null)
    const exported = api.exportForChatGPT(size)
    const ok = await copyLater(exported.then((d) => d.text))
    try {
      const d = await exported
      setCopied({ count: d.count, text: d.text, ok: ok && d.count > 0 })
    } catch (e) {
      setError(e.message)
    } finally { setBusy(false) }
  }
  const applyPasted = async () => {
    setError(null); setBusy(true)
    try {
      const d = await api.applyPasted(pasted)
      setBatch(d.batch); setPasted(''); setCopied(null)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const applyReviewed = async (body) => {
    setError(null); setBusy(true)
    try { setBatch((await api.applyReviewed(batch.id, body)).batch) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const discard = async () => {
    setBusy(true)
    try { await api.discard(batch.id); setBatch(null); onChanged(); loadHistory() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const running = batch && ACTIVE.has(batch.status)
  const reviewing = batch?.status === 'review'
  const finished = batch && (batch.status === 'done' || batch.status === 'failed')
  const notConnected = summary && !summary.configured?.script

  return (
    <Drawer title="Sort new mail" onClose={onClose} wide={reviewing}>
      <p className="ibx-lead">{gmail?.error ? gmail.error : waitingSentence(gmail) || 'Checking Gmail…'}</p>

      {notConnected && (
        <div className="ibx-callout ibx-callout--warn">
          <p><strong>Gmail isn’t connected yet.</strong> Add <code>GMAIL_SCRIPT_URL</code> and <code>GMAIL_SCRIPT_SECRET</code> to the server’s .env (setup steps in mw-backend/INBOX.md), then reload.</p>
        </div>
      )}

      {running && <Steps batch={batch} />}

      {reviewing && <Review batch={batch} labels={labels} onApply={applyReviewed} onDiscard={discard} busy={busy} />}

      {finished && (
        <div className={`ibx-result${batch.status === 'failed' ? ' is-failed' : ''}`}>
          <p className="ibx-result-head">{batch.status === 'failed' ? 'That sort didn’t finish.' : 'Done.'}</p>
          <p>{batchSentence(batch)}</p>
          {batch.summary && batch.status === 'done' && <p className="ibx-result-summary">{batch.summary}</p>}
          {batch.status === 'done' && batch.missing > 0 && <p className="ibx-muted">{plural(batch.missing, 'email')} had already left Gmail.</p>}
          <div className="ibx-btn-row">
            {batch.status === 'done' && batch.applied > 0 && <button type="button" className="ibx-btn ibx-btn--primary" onClick={onShowHighlights}>Show highlights</button>}
            <button type="button" className="ibx-btn" onClick={() => setBatch(null)}>Sort more</button>
          </div>
        </div>
      )}

      {!running && !reviewing && !finished && (
        <>
          <div className="ibx-tabs" role="tablist" aria-label="How to sort">
            <button type="button" role="tab" aria-selected={mode === 'ai'} className={mode === 'ai' ? 'is-current' : ''} onClick={() => setMode('ai')}>Sort with AI</button>
            <button type="button" role="tab" aria-selected={mode === 'chatgpt'} className={mode === 'chatgpt' ? 'is-current' : ''} onClick={() => setMode('chatgpt')}>Use ChatGPT</button>
          </div>

          <label className="ibx-field ibx-field--inline">
            <span>Emails per batch</span>
            <select className="ibx-select" value={size} onChange={(e) => setSize(Number(e.target.value))}>
              {[...new Set([...SIZES, size])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          {mode === 'ai' ? (
            <div className="ibx-mode" role="tabpanel">
              <p>The server’s AI ({summary?.configured?.ai || 'not set'}) reads the next {size} unread emails with your prompt and people list, then labels, marks read and archives them in Gmail.</p>
              <label className="ibx-check">
                <input type="checkbox" checked={review} onChange={(e) => setReview(e.target.checked)} />
                <span>Let me review before anything changes in Gmail</span>
              </label>
              <button type="button" className="ibx-btn ibx-btn--primary ibx-btn--big" onClick={start} disabled={busy || notConnected}>
                {busy ? <span className="ibx-spinner" /> : <Icon name="sort" />} Sort {size} emails
              </button>
            </div>
          ) : (
            <div className="ibx-mode" role="tabpanel">
              <ol className="ibx-numbered">
                <li>
                  <p>Copy the next {size} emails with your prompt, then paste them into ChatGPT.</p>
                  <button type="button" className="ibx-btn ibx-btn--primary" onClick={copyForChatGPT} disabled={busy || notConnected}>
                    {busy && !pasted ? <span className="ibx-spinner" /> : <Icon name="copy" />} Copy {size} emails for ChatGPT
                  </button>
                  {copied && (
                    copied.count === 0 ? <p className="ibx-muted">Nothing is waiting in Gmail.</p>
                      : copied.ok ? <p className="ibx-ok">Copied {plural(copied.count, 'email')} and the prompt.</p>
                        : (
                          <details className="ibx-copybox" open>
                            <summary>Your browser blocked copying. Select all of this and copy it.</summary>
                            <textarea readOnly className="ibx-textarea ibx-textarea--mono" value={copied.text} onFocus={(e) => e.target.select()} />
                          </details>
                        )
                  )}
                </li>
                <li>
                  <p>Paste ChatGPT’s reply here.</p>
                  <textarea className="ibx-textarea ibx-textarea--mono" rows={7} value={pasted} onChange={(e) => setPasted(e.target.value)}
                    placeholder={'{"actions":[{"id":"…","labels":["A. Read"],"importance":"low","archive_ok":true}],"summary":"…"}'} />
                  <button type="button" className="ibx-btn ibx-btn--primary" onClick={applyPasted} disabled={busy || !pasted.trim()}>Apply to Gmail</button>
                </li>
              </ol>
            </div>
          )}
        </>
      )}

      {error && <p className="ibx-error" role="alert">{error}</p>}

      {history.length > 0 && !reviewing && (
        <section className="ibx-history" aria-labelledby="ibx-history-h">
          <h3 id="ibx-history-h">Earlier sorts</h3>
          <ul>
            {history.slice(0, 8).map((b) => (
              <li key={b.id} className={`is-${b.status}`}>
                <p className="ibx-history-when">{when(b.created_at)}, from {SOURCE_NAMES[b.source] || b.source}</p>
                <p>{batchSentence(b)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Drawer>
  )
}
