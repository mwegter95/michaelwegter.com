// Talks to mw-backend's /inbox blueprint on the Surface (see mw-backend/INBOX.md), and — only for
// "Sort on wegter-pc" — to inbox_local_ai.py on wegter-pc, which runs the emails through LM Studio.
// In demo mode the same calls are answered in the browser by ./mock.js.

const BASE =
  import.meta.env.VITE_INBOX_API ||
  (import.meta.env.DEV ? 'http://localhost:5050/inbox' : 'https://api.michaelwegter.com/inbox')
const LOCAL_AI =
  import.meta.env.VITE_LOCAL_AI_API ||
  (import.meta.env.DEV ? 'http://localhost:5057/jobs/local-ai' : 'https://jobs.michaelwegter.com/jobs/local-ai')

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body || {}
  }
}

async function request(base, token, path, { method = 'GET', body, signal, offline } = {}) {
  let res
  try {
    res = await fetch(base + path, {
      method,
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError(offline || "Can't reach the server. Check your connection and try again.", 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || `The server answered ${res.status}.`, res.status, data)
  return data
}

export function createApi(token) {
  const call = (path, opts) => request(BASE, token, path, opts)
  const q = (params) => {
    const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    const text = s.toString()
    return text ? `?${text}` : ''
  }
  return {
    summary: (opts) => call('/summary', opts),
    messages: (params, opts) => call('/messages' + q(params), opts),
    live: (refresh, opts) => call('/live' + q({ refresh: refresh ? 1 : undefined }), opts),
    status: (refresh) => call('/status' + q({ refresh: refresh ? 1 : undefined })),
    thread: (id, refresh) => call(`/thread/${encodeURIComponent(id)}` + q({ refresh: refresh ? 1 : undefined })),
    act: (ids, action, labels) => call('/actions', { method: 'POST', body: { ids, action, labels } }),
    settings: () => call('/settings'),
    saveSettings: (changes) => call('/settings', { method: 'PUT', body: changes }),
    labels: () => call('/labels'),
    // Sorting: export → (Claude or wegter-pc) → apply. {json} is Claude's pasted reply;
    // {actions, summary, source: 'wegter-pc'} is wegter-pc's; review waits for a look first.
    exportEmails: (limit) => call('/triage/export', { method: 'POST', body: { limit } }),
    applySorted: (body) => call('/triage/apply', { method: 'POST', body }),
    batches: () => call('/triage/batches'),
    batch: (id) => call(`/triage/batches/${id}`),
    applyReviewed: (id, body) => call(`/triage/batches/${id}/apply`, { method: 'POST', body }),
    discard: (id) => call(`/triage/batches/${id}/discard`, { method: 'POST', body: {} }),
    importHistory: () => call('/import', { method: 'POST', body: {} }),
    connection: () => call('/connection'),
  }
}

/** wegter-pc's LM Studio, reached from the browser (the Surface can't reach it). */
export function createLocalAi(token) {
  const offline = 'wegter-pc isn’t reachable. It may be asleep or off, or its server isn’t running.'
  const call = (path, opts) => request(LOCAL_AI, token, path, { offline, ...opts })
  return {
    health: () => call('/health'),
    sort: ({ prompt, emails, ids }, signal) => call('/inbox/sort', { method: 'POST', body: { prompt, emails, ids }, signal }),
    summarize: (lines) => call('/inbox/summarize', { method: 'POST', body: { lines } }),
  }
}
