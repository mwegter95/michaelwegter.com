import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// The single account allowed to see hidden/private work samples and open the
// private demos. Logging in as anyone else is valid but grants no owner access.
export const OWNER_EMAIL = 'zweetztuph@gmail.com'

// mw-backend auth API. Demos are served same-origin under michaelwegter.com, so
// the token persisted here is readable by them too (shared first-party storage).
const API = import.meta.env.DEV ? 'http://localhost:5050' : 'https://api.michaelwegter.com'
const TOKEN_KEY = 'mw-auth-token'
const USER_KEY = 'mw-auth-user'

const SiteAuthContext = createContext(null)

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export function SiteAuthProvider({ children }) {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })
  const [user, setUser] = useState(() => readJSON(USER_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    try {
      if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
      else localStorage.removeItem(TOKEN_KEY)
      if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      else localStorage.removeItem(USER_KEY)
    } catch {}
  }, [])

  // Validate any persisted token once on mount: refresh the user, or drop it if
  // the token has expired or been revoked.
  useEffect(() => {
    const t = (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()
    if (!t) return
    let alive = true
    ;(async () => {
      try {
        const r = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
        if (!r.ok) throw new Error('expired')
        const d = await r.json()
        if (alive && d.user) {
          setUser(d.user)
          try { localStorage.setItem(USER_KEY, JSON.stringify(d.user)) } catch {}
        }
      } catch {
        if (alive) persist(null, null)
      }
    })()
    return () => { alive = false }
  }, [persist])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: (email || '').trim(), password }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Login failed')
      persist(d.token, d.user)
      return d.user
    } catch (e) {
      setError(e.message || 'Login failed')
      throw e
    } finally {
      setLoading(false)
    }
  }, [persist])

  const logout = useCallback(() => {
    setError(null)
    persist(null, null)
  }, [persist])

  const isOwner = (user?.email || '').toLowerCase() === OWNER_EMAIL

  return (
    <SiteAuthContext.Provider value={{ token, user, isOwner, loading, error, login, logout, clearError: () => setError(null) }}>
      {children}
    </SiteAuthContext.Provider>
  )
}

export function useSiteAuth() {
  const ctx = useContext(SiteAuthContext)
  if (!ctx) throw new Error('useSiteAuth must be used within SiteAuthProvider')
  return ctx
}
