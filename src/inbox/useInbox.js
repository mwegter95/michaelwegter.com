import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SUMMARY_EVERY_MS = 60_000
const GMAIL_EVERY_MS = 180_000

// What each action changes on screen before the server answers.
const PATCHES = {
  read: () => ({ read: true }),
  unread: () => ({ read: false, gmail_unread: true }),
  pin: () => ({ pinned: true, pinned_at: new Date().toISOString() }),
  unpin: () => ({ pinned: false, pinned_at: null }),
  archive: () => ({ in_inbox: false, read: true }),
  inbox: () => ({ in_inbox: true, trashed: false }),
  star: () => ({ starred: true }),
  unstar: () => ({ starred: false }),
  trash: () => ({ trashed: true, in_inbox: false, pinned: false }),
}

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
  const [query, setQuery] = useState('')
  const [list, setList] = useState({ items: [], total: 0, loading: true, error: null, refreshing: false })
  const [selectedId, setSelectedId] = useState(null)
  const [threads, setThreads] = useState({})
  const [toasts, setToasts] = useState([])
  const listReq = useRef(0)
  const selectedSnapshot = useRef(null)

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

  const loadGmail = useCallback(async (refresh = false) => {
    try {
      setGmail({ ...(await api.status(refresh)), error: null })
    } catch (e) {
      setGmail((g) => ({ ...(g || {}), error: e.message, code: e.body?.code }))
    }
  }, [api])

  const loadList = useCallback(async ({ refresh = false, quiet = false } = {}) => {
    const req = ++listReq.current
    setList((l) => ({ ...l, loading: !quiet && !l.items.length, refreshing: quiet || Boolean(l.items.length), error: null }))
    try {
      const data = view === 'inbox' && !label && !query
        ? await api.live(refresh)
        : await api.messages({ view, label: label || undefined, q: query || undefined })
      if (req !== listReq.current) return
      setList({ items: data.items || [], total: data.total ?? (data.items || []).length, loading: false, refreshing: false, error: null, fetchedAt: data.fetched_at })
    } catch (e) {
      if (req !== listReq.current) return
      setList((l) => ({ ...l, loading: false, refreshing: false, error: e }))
    }
  }, [api, view, label, query])

  useEffect(() => { loadSummary(); loadGmail() }, [loadSummary, loadGmail])
  useEffect(() => { setList((l) => ({ ...l, items: [], loading: true })); loadList() }, [loadList])
  useEffect(() => {
    const a = setInterval(loadSummary, SUMMARY_EVERY_MS)
    const b = setInterval(() => loadGmail(), GMAIL_EVERY_MS)
    const onFocus = () => { loadSummary(); loadList({ quiet: true }) }
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(a); clearInterval(b); window.removeEventListener('focus', onFocus) }
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
    if (PATCHES[action]) patch(ids, PATCHES[action]())
    if (action === 'add_labels' || action === 'remove_labels') {
      patch(ids, (m) => ({
        labels: action === 'add_labels' ? [...new Set([...(m.labels || []), ...labels])] : (m.labels || []).filter((l) => !labels.includes(l)),
      }))
    }
    try {
      const res = await api.act(ids, action, labels)
      const byId = Object.fromEntries((res.updated || []).map((m) => [m.id, m]))
      if (Object.keys(byId).length) patch(Object.keys(byId), (m) => byId[m.id])
      const failed = Object.keys(res.failed || {})
      if (failed.length) toast(`Gmail couldn't update ${failed.length === ids.length ? 'that email' : `${failed.length} of them`}: ${Object.values(res.failed)[0]}`, { error: true })
      else if (!silent) {
        const undo = undoable && UNDO[action]
        toast(DONE_WORDS[action] || 'Done', undo ? { action: { label: 'Undo', run: () => act(ids, undo, { silent: true, undoable: false, labels }) } } : {})
      }
      if (action !== 'read') loadSummary()
      else setSummary((s) => s && {
        ...s,
        today: { ...s.today, read: s.today.read + ids.filter((id) => !before.find((m) => m.id === id)?.read).length },
        highlights: { ...s.highlights, unread: Math.max(0, s.highlights.unread - ids.filter((id) => { const m = before.find((x) => x.id === id); return m && !m.read && (m.importance === 'high' || m.personal) }).length) },
      })
    } catch (e) {
      const restore = Object.fromEntries(before.map((m) => [m.id, m]))
      setList((l) => {
        const present = new Set(l.items.map((m) => m.id))
        const back = ids.filter((id) => !present.has(id) && restore[id] && list.items.some((m) => m.id === id)).map((id) => restore[id])
        return { ...l, items: [...l.items.map((m) => restore[m.id] || m), ...back].sort((a, b) => (a.date < b.date ? 1 : -1)) }
      })
      loadSummary()
      toast(e.message || 'That didn’t work.', { error: true })
    }
  }, [api, list.items, summary, patch, toast, loadSummary])

  const loadThread = useCallback(async (id, refresh = false) => {
    setThreads((t) => ({ ...t, [id]: { ...(t[id] || {}), loading: true, error: null } }))
    try {
      const data = await api.thread(id, refresh)
      setThreads((t) => ({ ...t, [id]: { loading: false, error: null, data: data.thread } }))
      if (data.message) patch([id], data.message)
    } catch (e) {
      setThreads((t) => ({ ...t, [id]: { loading: false, error: e } }))
    }
  }, [api, patch])

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
    if (m && !m.read) act([id], 'read', { silent: true })
  }, [allKnown, threads, loadThread, act])

  const refreshAll = useCallback(() => {
    loadSummary()
    loadGmail(true)
    loadList({ refresh: true, quiet: true })
  }, [loadSummary, loadGmail, loadList])

  const chooseView = useCallback((v) => { setView(v); setLabel(''); setQuery('') }, [])
  const chooseLabel = useCallback((l) => { setLabel(l); setView('sorted'); setQuery('') }, [])

  return {
    summary, summaryError, gmail, view, label, query, list, selected, selectedId, threads, toasts,
    setQuery, chooseView, chooseLabel, open, close: () => setSelectedId(null), act, loadThread,
    refreshAll, loadSummary, loadList, loadGmail, toast, dismissToast,
  }
}
