import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Drawer from './Drawer'
import Icon from './Icons'
import { batchSentence, dayLabel, dayKey, labelText, plural, SOURCE_NAMES, toDate, waitingSentence } from '../format'

const ACTIVE = new Set(['running', 'applying'])
const SIZES = [10, 25, 50, 100]
const CHUNK = 8               // emails per call to wegter-pc: each call has to finish inside Cloudflare's 100 s
const BUSY_RETRIES = 40       // wegter-pc answers 409 while it's sorting something else; wait it out
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

function ReviewRow({ a, include, onInclude, onChange }) {
  const [adding, setAdding] = useState('')
  return (
    <li className={`ibx-review-row${include ? '' : ' is-skipped'}${a.importance === 'high' ? ' is-high' : ''}${a.personal ? ' is-personal' : ''}`}>
      <label className="ibx-review-include">
        <input type="checkbox" checked={include} onChange={(e) => onInclude(e.target.checked)} />
        <span className="ibx-sr">Include this email</span>
      </label>
      <div className="ibx-review-main">
        <p className="ibx-review-from">{(a.from || '').replace(/<.*>/, '').trim() || a.from || 'Unknown sender'}{a.personal && <span className="ibx-kind">personal</span>}</p>
        <p className="ibx-review-subject"><span className={a.importance === 'high' ? 'ibx-mark' : undefined}>{a.subject || a.id}</span></p>
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
      {batch.summary && <aside className="ibx-note"><p className="ibx-note-head">Batch summary from {SOURCE_NAMES[batch.source] || batch.source}</p><p>{batch.summary}</p></aside>}
      <p className="ibx-muted">Nothing has changed in Gmail yet. Adjust anything that looks off, then apply.</p>
      <datalist id="ibx-label-options">{labels.map((l) => <option key={l} value={l} />)}</datalist>
      <ul className="ibx-review-list">
        {rows.map((a) => (
          <ReviewRow key={a.id} a={a} include={!skip.has(a.id)}
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

/** Progress of a sort running through wegter-pc, driven from this page. */
function PcProgress({ run, review, onStop }) {
  const order = ['export', 'sort', 'summary', 'apply']
  const at = order.indexOf(run.phase)
  const steps = [
    run.total ? `Read ${plural(run.total, 'unread email')} from Gmail` : 'Read unread email from Gmail',
    run.total ? `Sort them on wegter-pc (${Math.min(run.done, run.total)} of ${run.total})` : 'Sort them on wegter-pc',
    'Write the batch summary',
    review ? 'Get the review ready' : 'Apply labels, read and archive in Gmail',
  ]
  const pct = run.total ? Math.round((run.done / run.total) * 100) : 0
  return (
    <div className="ibx-pc-run">
      <ol className="ibx-steps" aria-live="polite">
        {steps.map((text, i) => (
          <li key={i} className={i < at ? 'is-done' : i === at ? 'is-now' : ''}>
            <span className="ibx-step-mark">{i < at ? <Icon name="check" size={12} /> : i === at ? <span className="ibx-spinner" /> : null}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      {run.phase === 'sort' && (
        <div className="ibx-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Sorted on wegter-pc">
          <div className="ibx-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      {run.note && <p className="ibx-muted">{run.note}</p>}
      {(run.phase === 'export' || run.phase === 'sort') && (
        <button type="button" className="ibx-btn" onClick={onStop}>Stop</button>
      )}
    </div>
  )
}

function PcStatus({ pc, onCheck }) {
  if (!pc) return <p className="ibx-muted">Checking wegter-pc…</p>
  if (pc.error) return <p className="ibx-pc-status"><span className="ibx-bad-dot" />{pc.error} <button type="button" className="ibx-link-btn" onClick={onCheck}>Check again</button></p>
  if (!pc.ok) return <p className="ibx-pc-status"><span className="ibx-bad-dot" />LM Studio isn’t running on wegter-pc. Open LM Studio and start its server. <button type="button" className="ibx-link-btn" onClick={onCheck}>Check again</button></p>
  if (!pc.model_ready) return <p className="ibx-pc-status"><span className="ibx-bad-dot" />LM Studio is running, but {pc.model} isn’t loaded. <button type="button" className="ibx-link-btn" onClick={onCheck}>Check again</button></p>
  return <p className="ibx-pc-status"><span className="ibx-ok-dot" />wegter-pc is ready: {pc.model} in LM Studio.</p>
}

export default function SortDrawer({ api, localAi, summary, gmail, labels, onClose, onChanged, onShowHighlights }) {
  const [mode, setMode] = useState('claude')
  const [size, setSize] = useState(summary?.settings?.batch_size || 50)
  const [batch, setBatch] = useState(summary?.running_batch || null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState([])
  // Claude
  const [copied, setCopied] = useState(null)   // {count, text, ok}
  const [pasted, setPasted] = useState('')
  const [reviewPaste, setReviewPaste] = useState(false)
  // wegter-pc
  const [reviewPc, setReviewPc] = useState(summary?.settings?.review_first ?? true)
  const [pc, setPc] = useState(null)
  const [run, setRun] = useState(null)         // {phase, done, total, note}
  const stopRef = useRef(null)
  const timer = useRef(null)

  const loadHistory = useCallback(() => api.batches().then((d) => setHistory(d.batches || [])).catch(() => {}), [api])
  useEffect(() => { loadHistory() }, [loadHistory])
  useEffect(() => {
    // Pick up a review left from earlier.
    if (!batch && summary?.latest_batch?.status === 'review') {
      api.batch(summary.latest_batch.id).then((d) => setBatch(d.batch)).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopRef.current?.abort(), [])   // closing the drawer stops a wegter-pc run

  const checkPc = useCallback(async () => {
    setPc(null)
    try { setPc(await localAi.health()) } catch (e) { setPc({ error: e.message }) }
  }, [localAi])
  useEffect(() => { if (mode === 'wegter' && !pc) checkPc() }, [mode, pc, checkPc])

  // Poll a batch while Gmail is being updated.
  useEffect(() => {
    clearTimeout(timer.current)
    if (!batch || !ACTIVE.has(batch.status)) return
    timer.current = setTimeout(async () => {
      try { setBatch((await api.batch(batch.id)).batch) } catch (e) { setError(e.message) }
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

  const copyForClaude = async () => {
    setError(null); setBusy(true); setCopied(null)
    const exported = api.exportEmails(size)
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
      const d = await api.applySorted({ json: pasted, source: 'claude', review: reviewPaste })
      setBatch(d.batch); setPasted(''); setCopied(null)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const sortOnPc = async () => {
    setError(null)
    const ctl = new AbortController()
    stopRef.current = ctl
    const stopped = () => ctl.signal.aborted
    try {
      setRun({ phase: 'export', done: 0, total: 0 })
      const exp = await api.exportEmails(size)
      if (stopped()) throw new DOMException('stopped', 'AbortError')
      if (!exp.count) { setRun(null); setError('Gmail has nothing new to sort.'); return }
      const ids = exp.items.map((i) => i.id)
      const actions = []
      for (let i = 0; i < ids.length; i += CHUNK) {
        setRun({ phase: 'sort', done: i, total: ids.length })
        const part = { prompt: exp.prompt, emails: exp.blocks.slice(i, i + CHUNK).join('\n'), ids: ids.slice(i, i + CHUNK) }
        for (let attempt = 0; ; attempt++) {
          if (stopped()) throw new DOMException('stopped', 'AbortError')
          try {
            const res = await localAi.sort(part, ctl.signal)
            actions.push(...res.actions)
            break
          } catch (e) {
            if (e.name === 'AbortError') throw e
            if (e.status === 409 && attempt < BUSY_RETRIES) {
              setRun({ phase: 'sort', done: i, total: ids.length, note: 'wegter-pc is finishing something else. Waiting…' })
              await sleep(3000)
              continue
            }
            if (e.body?.code === 'timeout' && attempt === 0) continue   // one more try for a slow answer
            throw e
          }
        }
      }
      setRun({ phase: 'summary', done: ids.length, total: ids.length })
      const byId = Object.fromEntries(exp.items.map((it) => [it.id, it]))
      const lines = actions.map((a) => `${(byId[a.id]?.from || '').replace(/<.*>/, '').trim()}: ${byId[a.id]?.subject || ''} (${a.importance}). ${a.summary}`)
      let note = ''
      try { note = (await localAi.summarize(lines)).summary } catch { /* the note is a nicety */ }
      setRun({ phase: 'apply', done: ids.length, total: ids.length })
      const d = await api.applySorted({ actions, summary: note, source: 'wegter-pc', review: reviewPc })
      setRun(null)
      setBatch(d.batch)
    } catch (e) {
      setRun(null)
      setError(e.name === 'AbortError' ? 'Stopped. Nothing changed in Gmail.' : e.message)
    } finally {
      stopRef.current = null
    }
  }

  const applyReviewed = async (body) => {
    setError(null); setBusy(true)
    try { setBatch((await api.applyReviewed(batch.id, body)).batch) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const discard = async () => {
    setBusy(true)
    try { await api.discard(batch.id); setBatch(null); onChanged(); loadHistory() } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const applying = batch && ACTIVE.has(batch.status)
  const reviewing = batch?.status === 'review'
  const finished = batch && (batch.status === 'done' || batch.status === 'failed')
  const notConnected = summary && !summary.configured?.script
  const idle = !applying && !reviewing && !finished && !run
  const pcReady = pc?.ok && pc?.model_ready

  return (
    <Drawer title="Sort new mail" onClose={onClose} wide={reviewing}>
      <p className="ibx-lead">{gmail?.error ? gmail.error : waitingSentence(gmail) || 'Checking Gmail…'}</p>

      {notConnected && (
        <div className="ibx-callout ibx-callout--warn">
          <p><strong>Gmail isn’t connected yet.</strong> Add <code>GMAIL_SCRIPT_URL</code> and <code>GMAIL_SCRIPT_SECRET</code> to the server’s .env (setup steps in mw-backend/INBOX.md), then reload.</p>
        </div>
      )}

      {run && <PcProgress run={run} review={reviewPc} onStop={() => stopRef.current?.abort()} />}

      {applying && (
        <p className="ibx-applying" aria-live="polite"><span className="ibx-spinner" /> {batch.step && batch.step !== 'Applying' ? batch.step : 'Applying labels, read and archive in Gmail'}</p>
      )}

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

      {idle && (
        <>
          <div className="ibx-tabs" role="tablist" aria-label="How to sort">
            <button type="button" role="tab" aria-selected={mode === 'claude'} className={mode === 'claude' ? 'is-current' : ''} onClick={() => setMode('claude')}>Copy for Claude</button>
            <button type="button" role="tab" aria-selected={mode === 'wegter'} className={mode === 'wegter' ? 'is-current' : ''} onClick={() => setMode('wegter')}>Sort on wegter-pc</button>
          </div>

          <label className="ibx-field ibx-field--inline">
            <span>Emails per batch</span>
            <select className="ibx-select" value={size} onChange={(e) => setSize(Number(e.target.value))}>
              {[...new Set([...SIZES, size])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          {mode === 'claude' ? (
            <div className="ibx-mode" role="tabpanel">
              <ol className="ibx-numbered">
                <li>
                  <p>Copy the next {size} unread emails with your triage prompt.</p>
                  <div className="ibx-btn-row ibx-btn-row--start">
                    <button type="button" className="ibx-btn ibx-btn--primary" onClick={copyForClaude} disabled={busy || notConnected}>
                      {busy && !pasted ? <span className="ibx-spinner" /> : <Icon name="copy" />} Copy {size} emails for Claude
                    </button>
                    <a className="ibx-btn" href="https://claude.ai/new" target="_blank" rel="noopener noreferrer"><Icon name="external" /> Open Claude</a>
                  </div>
                  {copied && (
                    copied.count === 0 ? <p className="ibx-muted">Nothing is waiting in Gmail.</p>
                      : copied.ok ? <p className="ibx-ok">Copied {plural(copied.count, 'email')} and the prompt. Paste them into Claude.</p>
                        : (
                          <details className="ibx-copybox" open>
                            <summary>Your browser blocked copying. Select all of this and copy it.</summary>
                            <textarea readOnly className="ibx-textarea ibx-textarea--mono" value={copied.text} onFocus={(e) => e.target.select()} />
                          </details>
                        )
                  )}
                </li>
                <li>
                  <p>Paste Claude’s reply here.</p>
                  <textarea className="ibx-textarea ibx-textarea--mono" rows={7} value={pasted} onChange={(e) => setPasted(e.target.value)} aria-label="Claude's reply"
                    placeholder={'{"actions":[{"id":"…","labels":["A. Read"],"importance":"low","archive_ok":true}],"summary":"…"}'} />
                  <label className="ibx-check">
                    <input type="checkbox" checked={reviewPaste} onChange={(e) => setReviewPaste(e.target.checked)} />
                    <span>Let me review before anything changes in Gmail</span>
                  </label>
                  <button type="button" className="ibx-btn ibx-btn--primary" onClick={applyPasted} disabled={busy || !pasted.trim()}>
                    {reviewPaste ? 'Review' : 'Apply to Gmail'}
                  </button>
                </li>
              </ol>
            </div>
          ) : (
            <div className="ibx-mode" role="tabpanel">
              <PcStatus pc={pc} onCheck={checkPc} />
              <p>Your browser takes the next {size} unread emails to Gemma in LM Studio on wegter-pc, {CHUNK} at a time, with your prompt and people list. No outside AI service sees them, and nothing changes in Gmail until the end.</p>
              <label className="ibx-check">
                <input type="checkbox" checked={reviewPc} onChange={(e) => setReviewPc(e.target.checked)} />
                <span>Let me review before anything changes in Gmail</span>
              </label>
              <button type="button" className="ibx-btn ibx-btn--primary ibx-btn--big" onClick={sortOnPc} disabled={!pcReady || notConnected}>
                <Icon name="sort" /> Sort {size} emails on wegter-pc
              </button>
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
