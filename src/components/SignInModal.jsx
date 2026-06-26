import { useState, useEffect, useRef } from 'react'
import { useSiteAuth, OWNER_EMAIL } from '../auth/SiteAuth'

/**
 * SignInModal — lightweight email/password modal for the site owner.
 *
 * Non-blocking: the site works fully signed out. Signing in as the owner reveals
 * hidden work samples and unlocks the private demos (which share this token via
 * same-origin localStorage).
 */
export default function SignInModal({ open, onClose }) {
  const { login, loading, error, clearError, user, isOwner } = useSiteAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const emailRef = useRef(null)

  useEffect(() => {
    if (open) {
      clearError()
      setPassword('')
      setEmail((e) => e || (user?.email ?? ''))
      setTimeout(() => emailRef.current?.focus(), 50)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    try {
      const u = await login(email, password)
      if ((u?.email || '').toLowerCase() !== OWNER_EMAIL) {
        // Logged in successfully, but not the owner — keep the session, just inform.
        return
      }
      onClose()
    } catch {
      /* error is surfaced via the auth context */
    }
  }

  const notOwner = user && !isOwner

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5, 8, 16, 0.72)', backdropFilter: 'blur(4px)', padding: '20px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderTop: '3px solid var(--accent, #E8991A)',
        padding: '26px 24px 24px', position: 'relative',
      }}>
        <button onClick={onClose} aria-label="Close"
          style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>
          ×
        </button>

        <span className="label" style={{ display: 'block', marginBottom: '8px' }}>Owner Access</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Sign in
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
          Signing in reveals private work samples and unlocks the protected demos. The rest of the site is open to everyone.
        </p>

        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px', fontFamily: 'var(--font-mono)' }}>Email</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="you@example.com"
            style={inputStyle}
          />
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', margin: '14px 0 5px', fontFamily: 'var(--font-mono)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            style={inputStyle}
          />

          {error && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#F87171' }}>{error}</div>
          )}
          {notOwner && !error && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Signed in as {user.email}. This account does not have owner access, so private items stay hidden.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%', marginTop: '18px', padding: '11px',
              background: 'var(--text-primary)', color: 'var(--bg-base, #0b0b0f)',
              border: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: loading || !email || !password ? 'default' : 'pointer',
              opacity: loading || !email || !password ? 0.55 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'var(--bg-base, #0b0b0f)', border: '1px solid var(--border-default)',
  color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-sans)',
  borderRadius: '4px', outline: 'none',
}
