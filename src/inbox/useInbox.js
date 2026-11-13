import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Each Gmail check spends reads from Google's 20,000-a-day allowance for Apps Script, so Gmail is
// asked rarely and never while the tab is hidden. The summary comes from the server's own database.
export const SUMMARY_EVERY_MS = 60_000
export const GMAIL_EVERY_MS = 600_000
const FOCUS_RELOAD_AFTER_MS = 120_000
// How long a change made here is laid over lists that come back from the server: long enough for
// any request that left before the change was saved to have landed.
const KEEP_CHANGES_MS = 60_000

// What each action changes on screen before the server answers.
const PATCHES = {
  read: () => ({ read: true, gmail_unread: false }),
  unread: () => ({ read: false, gmail_unread: true }),
  pin: () => ({ pinned: true, pinned_at: new Date().toISOString() }),
  unpin: () => ({ pinned: false, pinned_at: null }),
  archive: () => ({ in_inbox: false, read: true }),
  inbox: () => ({ in_inbox: true, trashed: false }),
  star: () => ({ starred: true }),
  unstar: () => ({ starred: false }),
  trash: () => ({ trashed: true, in_inbox: false, pinned: false }),
}

const toTime = (iso) => new Date(iso || 0).getTime() || 0

/** Views that can be narrowed to chosen sorts. */
export const SORT_VIEWS = ['highlights', 'recent', 'sorted']

const UNDO = { archive: 'inbox', trash: 'inbox', unpin: 'pin', pin: 'unpin', unread: 'read' }
const DONE_WORDS = {
  archive: 'Archived', trash: 'Moved to trash', unpin: 'Unpinned', pin: 'Pinned',
  unread: 'Marked unread', star: 'Starred', unstar: 'Unstarred', inbox: 'Moved to inbox',
  add_labels: 'Label added', remove_labels: 'Label removed',
}

/** Does an email still belong in the view after a change? */
function belongs(view, m) {
  if (m.trashed) return false
  if (view === 'inbox') return m.in_inbox
  if (view === 'pinned') return m.pinned
  return true
}

export function useInbox(api) {
  const [summary, setSummary] = useState(null)
  const [summaryError, setSummaryError] = useState(null)
  const [gmail, setGmail] = useState(null)
  const [view, setView] = useState('highlights')
  const [label, setLabel] = useState('')
  const [sorts, setSorts] = useState([])   // chosen sorts, as the picker describes them
  const [sortInfo, setSortInfo] = useState({})   // key → the server's latest description (note, counts)
  const [query, setQuery] = useState('')
  const [list, setList] = useState({ items: [], total: 0, loading: true, error: null, refreshing: false })
  const [selectedId, setSelectedId] = useState(null)
  const [threads, setThreads] = useState({})
  const [toasts, setToasts] = useState([])
  const listReq = useRef(0)
  const lastGmail = useRef(0)
  const lastList = useRef(0)
  const lastChange = useRef(undefined)   // the server's changed_at from Gmail, last seen
  const selectedSnapshot = useRef(null)
  // id → { fields, until }: what this page changed, so a list or thread loaded while the change was
  // still saving (read in Recently sorted, then open Highlights) shows it at once.
  const recent = useRef(new Map())

  const toast = useCallback((text, opts = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t.slice(-2), { id, text, ...opts }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.error ? 7000 : 5000)
  }, [])
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await api.summary())
      setSummaryError(null)
    } catch (e) {
      setSummaryError(e)
    }
  }, [api])

  const remember = useCallback((ids, fields, ms) => {
    const until = Date.now() + ms
    for (const id of ids) {
      const prev = recent.current.get(id)
      recent.current.set(id, { fields: { ...(prev?.fields || {}), ...fields }, until })
    }
  }, [])
  const overlay = useCallback((items) => {
    const now = Date.now()
    return items.map((m) => {
      const r = recent.current.get(m.id)
      if (!r) return m
      if (r.until < now) { recent.current.delete(m.id); return m }
      return { ...m, ...r.fields }
    })
  }, [])

  const loadGmail = useCallback(async (refresh = false) => {
    lastGmail.current = Date.now()
    try {
      const data = await api.status(refresh)
      // During a quota backoff the server sends its last counts, marked: keep them and say why.
      setGmail({ ...data, error: data.quota ? (data.error || 'Gmail’s daily limit is used up.') : null, code: data.quota ? 'quota' : undefined })
      return data
    } catch (e) {
      setGmail((g) => ({ ...(g || {}), error: e.message, code: e.body?.code }))
      return null
    }
  }, [api])

  const loadList = useCallback(async ({ refresh = false, quiet = false } = {}) => {
    const req = ++listReq.current
    lastList.current = Date.now()
    setList((l) => ({ ...l, loading: !quiet && !l.items.length, refreshing: quiet || Boolean(l.items.length), error: null }))
    try {
      const data = view === 'inbox' && !label && !query
        ? await api.live(refresh)
        : await api.messages({
          view, label: label || undefined, q: query || undefined,
          sort: SORT_VIEWS.includes(view) && sorts.length ? sorts.map((s) => s.key).join(',') : undefined,
        })
      if (req !== listReq.current) return
      if (data.sorts?.length) setSortInfo((m) => ({ ...m, ...Object.fromEntries(data.sorts.map((s) => [s.key, s])) }))
      const items = overlay(data.items || []).filter((m) => belongs(view, m))
      setList({ items, total: data.total ?? items.length, loading: false, refreshing: false, error: null, fetchedAt: data.fetched_at })
    } catch (e) {
      if (req !== listReq.current) return
      setList((l) => ({ ...l, loading: false, refreshing: false, error: e }))
    }
  }, [api, view, label, query, sorts, overlay])

  // Reading, archiving or marking unread in Gmail reaches the server with the Gmail counts; when it
  // changed something, show it.
  useEffect(() => {
    const at = gmail?.changed_at
    if (lastChange.current === undefined) { lastChange.current = at ?? null; return }
    if (at && at !== lastChange.current) {
      lastChange.current = at
      loadSummary()
      loadList({ quiet: true })
    }
  }, [gmail?.changed_at, loadSummary, loadList])

  useEffect(() => { loadSummary(); loadGmail() }, [loadSummary, loadGmail])
  useEffect(() => { setList((l) => ({ ...l, items: [], loading: true })); loadList() }, [loadList])
  useEffect(() => {
    const visible = () => !document.hidden
    const a = setInterval(() => { if (visible()) loadSummary() }, SUMMARY_EVERY_MS)
    const b = setInterval(() => { if (visible()) loadGmail() }, GMAIL_EVERY_MS)
    // Coming back to a tab that sat hidden past a check: catch up once, then the timers carry on.
    const onVisible = () => { if (visible() && Date.now() - lastGmail.current >= GMAIL_EVERY_MS) loadGmail() }
    const onFocus = () => {
      loadSummary()
      if (Date.now() - lastList.current >= FOCUS_RELOAD_AFTER_MS) loadList({ quiet: true })
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(a); clearInterval(b)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [loadSummary, loadGmail, loadList])

  // Apply a change to every copy of an email on screen.
  const patch = useCallback((ids, changes) => {
    const set = new Set(ids)
    const apply = (m) => (set.has(m.id) ? { ...m, ...(typeof changes === 'function' ? changes(m) : changes) } : m)
    setList((l) => ({ ...l, items: l.items.map(apply).filter((m) => !set.has(m.id) || belongs(view, m)) }))
    setSummary((s) => {
      if (!s) return s
      let pins = s.pins.map(apply).filter((m) => m.pinned && !m.trashed)
      for (const id of ids) {
        if (!pins.some((p) => p.id === id)) {
          const m = [...list.items, selectedSnapshot.current].find((x) => x && x.id === id)
          const next = m && apply(m)
          if (next?.pinned) pins = [next, ...pins]
        }
      }
      return { ...s, pins }
    })
    if (selectedSnapshot.current && set.has(selectedSnapshot.current.id)) {
      selectedSnapshot.current = apply(selectedSnapshot.current)
    }
  }, [view, list.items])

  const act = useCallback(async (ids, action, { labels, silent = false, undoable = true } = {}) => {
    if (!ids.length) return
    const before = [...list.items, ...(summary?.pins || []), selectedSnapshot.current].filter(Boolean)
    if (PATCHES[action]) {
      const fields = PATCHES[action]()
      patch(ids, fields)
      remember(ids, fields, 10 * 60_000)   // until the server answers (shortened below)
    }
    if (action === 'add_labels' || action === 'remove_labels') {
      patch(ids, (m) => ({
        labels: action === 'add_labels' ? [...new Set([...(m.labels || []), ...labels])] : (m.labels || []).filter((l) => !labels.includes(l)),
      }))
    }
    try {
      const res = await api.act(ids, action, labels)
      const byId = Object.fromEntries((res.updated || []).map((m) => [m.id, m]))
      if (Object.keys(byId).length) patch(Object.keys(byId), (m) => byId[m.id])
      for (const [id, row] of Object.entries(byId)) remember([id], row, KEEP_CHANGES_MS)
      const failed = Object.keys(res.failed || {})
      if (failed.length) toast(`Gmail couldn't update ${failed.length === ids.length ? 'that email' : `${failed.length} of them`}: ${Object.values(res.failed)[0]}`, { error: true })
      else if (!silent) {
        const undo = undoable && UNDO[action]
        toast(DONE_WORDS[action] || 'Done', undo ? { action: { label: 'Undo', run: () => act(ids, undo, { silent: true, undoable: false, labels }) } } : {})
      }
      loadSummary()
    } catch (e) {
      for (const id of ids) recent.current.delete(id)
      const restore = Object.fromEntries(before.map((m) => [m.id, m]))
      setList((l) => {
        const present = new Set(l.items.map((m) => m.id))
        const back = ids.filter((id) => !present.has(id) && restore[id] && list.items.some((m) => m.id === id)).map((id) => restore[id])
        return { ...l, items: [...l.items.map((m) => restore[m.id] || m), ...back].sort((a, b) => (a.date < b.date ? 1 : -1)) }
      })
      loadSummary()
      toast(e.message || 'That didn’t work.', { error: true })
    }
  }, [api, list.items, summary, patch, toast, loadSummary, remember])

  const loadThread = useCallback(async (id, refresh = false) => {
    setThreads((t) => ({ ...t, [id]: { ...(t[id] || {}), loading: true, error: null } }))
    try {
      const data = await api.thread(id, refresh)
      setThreads((t) => ({ ...t, [id]: { loading: false, error: null, data: data.thread } }))
      if (data.message) patch([id], overlay([data.message])[0])
    } catch (e) {
      setThreads((t) => ({ ...t, [id]: { loading: false, error: e } }))
    }
  }, [api, patch, overlay])

  const allKnown = useMemo(() => {
    const map = new Map()
    for (const m of summary?.pins || []) map.set(m.id, m)
    for (const m of list.items) map.set(m.id, m)
    return map
  }, [summary, list.items])

  const selected = selectedId ? (allKnown.get(selectedId) || (selectedSnapshot.current?.id === selectedId ? selectedSnapshot.current : null)) : null
  useEffect(() => { if (selected) selectedSnapshot.current = selected }, [selected])

  const open = useCallback((id) => {
    setSelectedId(id)
    if (!id) return
    const m = allKnown.get(id)
    if (m) selectedSnapshot.current = m
    if (!threads[id]?.data && !threads[id]?.loading) loadThread(id)
    if (m && !m.read) {
      act([id], 'read', { silent: true })
      // The counts move now, not when Gmail has answered.
      setSummary((s) => s && {
        ...s,
        today: { ...s.today, read: s.today.read + 1 },
        highlights: { ...s.highlights, unread: Math.max(0, s.highlights.unread - (m.importance === 'high' || m.personal ? 1 : 0)) },
      })
    }
  }, [allKnown, threads, loadThread, act])

  const refreshAll = useCallback(() => {
    loadSummary()
    loadGmail(true)   // also brings in what was read or archived in Gmail; the list reloads again if that changed anything
    loadList({ refresh: true, quiet: true })
  }, [loadSummary, loadGmail, loadList])

  const chooseView = useCallback((v) => { setView(v); setLabel(''); setQuery(''); setSorts([]) }, [])
  const chooseLabel = useCallback((l) => { setLabel(l); setView('sorted'); setQuery(''); setSorts([]) }, [])
  // Newest first, whatever order they were ticked in.
  const chooseSorts = useCallback((list) => setSorts(list.filter((s) => s?.key).sort((a, b) => toTime(b.at) - toTime(a.at))), [])

  return {
    summary, summaryError, gmail, view, label, query, sorts, sortInfo, list, selected, selectedId, threads, toasts,
    setQuery, chooseView, chooseLabel, chooseSorts, open, close: () => setSelectedId(null), act, loadThread,
    refreshAll, loadSummary, loadList, loadGmail, toast, dismissToast,
  }
}
