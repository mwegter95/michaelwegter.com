// Talks to mw-backend's /inbox blueprint (see mw-backend/INBOX.md).
// In demo mode the same calls are answered in the browser by ./mock.js.

const BASE =
  import.meta.env.VITE_INBOX_API ||
  (import.meta.env.DEV ? 'http://localhost:5050/inbox' : 'https://api.michaelwegter.com/inbox')

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body || {}
  }
}

export function createApi(token) {
  async function call(path, { method = 'GET', body, signal } = {}) {
    let res
    try {
      res = await fetch(BASE + path, {
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
      throw new ApiError("Can't reach the server. Check your connection and try again.", 0)
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new ApiError(data.error || `The server answered ${res.status}.`, res.status, data)
    return data
  }
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
    runTriage: (body) => call('/triage/run', { method: 'POST', body }),
    exportForChatGPT: (limit) => call('/triage/export', { method: 'POST', body: { limit } }),
    applyPasted: (json) => call('/triage/apply', { method: 'POST', body: { json } }),
    batches: () => call('/triage/batches'),
    batch: (id) => call(`/triage/batches/${id}`),
    applyReviewed: (id, body) => call(`/triage/batches/${id}/apply`, { method: 'POST', body }),
    discard: (id) => call(`/triage/batches/${id}/discard`, { method: 'POST', body: {} }),
    importHistory: () => call('/import', { method: 'POST', body: {} }),
    connection: (ai) => call('/connection' + q({ ai: ai ? 1 : undefined })),
  }
}
