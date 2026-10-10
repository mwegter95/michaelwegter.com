import { useEffect, useState } from 'react'
import Drawer from './Drawer'
import Icon from './Icons'
import { batchSentence } from '../format'

const KINDS = [['family', 'Family'], ['friend', 'Friend'], ['vip', 'Close contact'], ['work', 'Work']]
const AUTO = [[0, 'Off'], [2, 'Every 2 hours'], [4, 'Every 4 hours'], [6, 'Every 6 hours'], [12, 'Twice a day'], [24, 'Once a day']]

function Toggle({ checked, onChange, children, hint }) {
  return (
    <label className="ibx-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}{hint && <small>{hint}</small>}</span>
    </label>
  )
}

function Connection({ api }) {
  const [state, setState] = useState(null)
  const [ai, setAi] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { api.connection(false).then(setState).catch((e) => setState({ error: e.message })) }, [api])
  const checkAi = async () => {
    setBusy(true)
    try { setAi((await api.connection(true)).ai) } catch (e) { setAi({ available: false, error: e.message }) } finally { setBusy(false) }
  }
  const s = state?.script
  return (
    <dl className="ibx-conn">
      <div>
        <dt>Gmail (Apps Script)</dt>
        <dd>{!state ? 'Checking…' : state.error ? state.error : !s?.configured ? 'Not connected. Set GMAIL_SCRIPT_URL and GMAIL_SCRIPT_SECRET.'
          : s.ok ? <><span className="ibx-ok-dot" /> Connected. {s.inbox_unread} unread in the inbox.</> : <><span className="ibx-bad-dot" /> {s.error}</>}</dd>
      </div>
      <div>
        <dt>AI for sorting</dt>
        <dd>
          {ai ? (ai.available ? <><span className="ibx-ok-dot" /> {ai.provider} ({ai.model}) is answering.</> : <><span className="ibx-bad-dot" /> {ai.error}</>)
            : <>{state?.ai?.provider || '…'} <button type="button" className="ibx-link-btn" onClick={checkAi} disabled={busy}>{busy ? 'Checking…' : 'Check it'}</button></>}
        </dd>
      </div>
      {s?.reports_to && <div><dt>Sheet batches report to</dt><dd className="ibx-mono">{s.reports_to}</dd></div>}
    </dl>
  )
}

export default function SettingsDrawer({ api, onClose, onSaved }) {
  const [s, setS] = useState(null)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [person, setPerson] = useState({ match: '', name: '', kind: 'family' })
  const [importState, setImportState] = useState(null)

  useEffect(() => {
    api.settings().then((d) => { setS(d); setDraft({ ...d, prompt: d.prompt || d.default_prompt }) }).catch((e) => setError(e.message))
  }, [api])

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
  const save = async () => {
    setSaving(true); setError(null)
    try {
      const { prompt, people, batch_size, query, review_first, keep_people_in_inbox, keep_important_unread, block_images, auto_sort_hours } = draft
      const d = await api.saveSettings({ prompt, people, batch_size, query, review_first, keep_people_in_inbox, keep_important_unread, block_images, auto_sort_hours })
      setS(d); setDraft({ ...d, prompt: d.prompt || d.default_prompt })
      onSaved?.(d)
      onClose()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }
  const addPerson = (e) => {
    e.preventDefault()
    const match = person.match.trim().toLowerCase()
    if (!match) return
    set('people', [...draft.people.filter((p) => p.match !== match), { ...person, match }])
    setPerson({ match: '', name: '', kind: person.kind })
  }
  const runImport = async () => {
    setImportState({ status: 'running', step: 'Starting' })
    try {
      let { batch } = await api.importHistory()
      while (batch.status === 'running') {
        setImportState(batch)
        await new Promise((r) => setTimeout(r, 1500))
        batch = (await api.batch(batch.id)).batch
      }
      setImportState(batch)
      onSaved?.()
    } catch (e) { setImportState({ status: 'failed', error: e.message }) }
  }

  const footer = draft && (
    <div className="ibx-btn-row">
      {error && <p className="ibx-error" role="alert">{error}</p>}
      <button type="button" className="ibx-btn" onClick={onClose}>Cancel</button>
      <button type="button" className="ibx-btn ibx-btn--primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
    </div>
  )

  return (
    <Drawer title="Inbox settings" onClose={onClose} footer={footer}>
      {!draft ? <p className="ibx-muted">{error || 'Loading…'}</p> : (
        <>
          <section className="ibx-set">
            <h3>Family and close contacts</h3>
            <p className="ibx-muted">Mail from these people is always highlighted as personal{draft.keep_people_in_inbox ? ' and never archived' : ''}. Add an address, or a domain like <code>example.org</code> to cover everyone there.</p>
            {draft.people.length > 0 && (
              <ul className="ibx-people">
                {draft.people.map((p) => (
                  <li key={p.match}>
                    <span className="ibx-people-name">{p.name || p.match}</span>
                    {p.name && <span className="ibx-mono ibx-muted">{p.match}</span>}
                    <span className="ibx-kind">{KINDS.find(([k]) => k === p.kind)?.[1] || p.kind}</span>
                    <button type="button" className="ibx-icon-btn" aria-label={`Remove ${p.name || p.match}`} onClick={() => set('people', draft.people.filter((x) => x.match !== p.match))}><Icon name="close" size={13} /></button>
                  </li>
                ))}
              </ul>
            )}
            <form className="ibx-person-form" onSubmit={addPerson}>
              <input className="ibx-input" placeholder="Email or domain" value={person.match} onChange={(e) => setPerson({ ...person, match: e.target.value })} aria-label="Email address or domain" />
              <input className="ibx-input" placeholder="Name" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} aria-label="Name" />
              <select className="ibx-select" value={person.kind} onChange={(e) => setPerson({ ...person, kind: e.target.value })} aria-label="Relationship">
                {KINDS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
              <button type="submit" className="ibx-btn">Add</button>
            </form>
            <Toggle checked={draft.keep_people_in_inbox} onChange={(v) => set('keep_people_in_inbox', v)}>Keep their mail in the inbox</Toggle>
          </section>

          <section className="ibx-set">
            <h3>Sorting</h3>
            <label className="ibx-field">
              <span>Emails per batch</span>
              <input className="ibx-input" type="number" min="1" max="100" value={draft.batch_size} onChange={(e) => set('batch_size', Number(e.target.value))} />
            </label>
            <label className="ibx-field">
              <span>Gmail search for mail to sort</span>
              <input className="ibx-input ibx-mono" placeholder="label:inbox is:unread newer_than:150d (the script’s default)" value={draft.query} onChange={(e) => set('query', e.target.value)} />
            </label>
            <Toggle checked={draft.review_first} onChange={(v) => set('review_first', v)}>Review AI sorts before applying</Toggle>
            <Toggle checked={draft.keep_important_unread} onChange={(v) => set('keep_important_unread', v)}
              hint="Important and personal mail stays bold in Gmail on your phone.">Leave important mail unread in Gmail</Toggle>
            <label className="ibx-field">
              <span>Sort automatically with AI</span>
              <select className="ibx-select" value={draft.auto_sort_hours} onChange={(e) => set('auto_sort_hours', Number(e.target.value))}>
                {AUTO.map(([h, label]) => <option key={h} value={h}>{label}</option>)}
              </select>
              <small>Automatic sorts apply right away, without a review.</small>
            </label>
          </section>

          <section className="ibx-set">
            <h3>Triage prompt</h3>
            <p className="ibx-muted">Used for AI sorts and copied with every ChatGPT export. <code>{'{{labels}}'}</code> becomes your label list and <code>{'{{people}}'}</code> your contacts. If you have a prompt you already use in ChatGPT, paste it here.</p>
            <textarea className="ibx-textarea ibx-textarea--mono" rows={14} value={draft.prompt} onChange={(e) => set('prompt', e.target.value)} aria-label="Triage prompt" />
            <div className="ibx-btn-row ibx-btn-row--start">
              <button type="button" className="ibx-btn" onClick={() => set('prompt', s.default_prompt)} disabled={draft.prompt === s.default_prompt}>Reset to default</button>
            </div>
            {s.detected_labels?.length > 0 && (
              <>
                <p className="ibx-muted">Labels offered to the AI ({s.detected_labels.length}), from your past sorts and Gmail:</p>
                <p className="ibx-label-cloud">{s.detected_labels.map((l) => <span key={l} className="ibx-chip">{l}</span>)}</p>
              </>
            )}
          </section>

          <section className="ibx-set">
            <h3>Reading</h3>
            <Toggle checked={draft.block_images} onChange={(v) => set('block_images', v)}
              hint="Stops senders from seeing when you open their email. You can still show images per email.">Hide images from the web</Toggle>
          </section>

          <section className="ibx-set">
            <h3>Connection</h3>
            <Connection api={api} />
          </section>

          <section className="ibx-set">
            <h3>History</h3>
            <p className="ibx-muted">Bring in everything logged on the Rollup sheet so past sorts are searchable here. Running it again only adds new rows.</p>
            <button type="button" className="ibx-btn" onClick={runImport} disabled={importState?.status === 'running'}>
              {importState?.status === 'running' ? <><span className="ibx-spinner" /> {importState.step || 'Importing'}</> : 'Import from the Rollup sheet'}
            </button>
            {importState && importState.status !== 'running' && <p className={importState.status === 'failed' ? 'ibx-error' : 'ibx-ok'}>{batchSentence(importState)}</p>}
          </section>
        </>
      )}
    </Drawer>
  )
}
