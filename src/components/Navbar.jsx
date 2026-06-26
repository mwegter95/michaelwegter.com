import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apps } from '../data/apps'
import { useSiteAuth } from '../auth/SiteAuth'
import SignInModal from './SignInModal'

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const { user, isOwner, logout } = useSiteAuth()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu and scroll to top on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
    window.scrollTo(0, 0)
  }, [location])

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">MW</span>
          <span className="navbar-logo-name">michaelwegter.com</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-nav">

          {/* Home */}
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>

          {/* Apps with dropdown */}
          <div className="nav-item" ref={dropdownRef}>
            <button
              className={`nav-link ${dropdownOpen ? 'open' : ''} ${isActive('/apps') ? 'active' : ''}`}
              onClick={() => setDropdownOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              Apps
              <svg className="nav-link-arrow" viewBox="0 0 10 6" width="10" height="6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
              {apps.slice(0, 5).map(app => {
                const inner = (
                  <>
                    <span className="dropdown-item-dot" style={{ background: app.color }} />
                    <span className="dropdown-item-name">{app.title}</span>
                  </>
                )
                if (app.slug && app.status !== 'soon' && app.href !== '#') {
                  return (
                    <Link
                      key={app.id}
                      to={`/apps/${app.slug}`}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {inner}
                    </Link>
                  )
                }
                return (
                  <a
                    key={app.id}
                    href={app.href}
                    className="dropdown-item"
                    target={app.href !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {inner}
                  </a>
                )
              })}
              <div className="dropdown-footer">
                <Link to="/apps" className="dropdown-view-all" onClick={() => setDropdownOpen(false)}>
                  View all apps
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Experience */}
          <Link
            to="/experience"
            className={`nav-link ${isActive('/experience') ? 'active' : ''}`}
          >
            Experience
          </Link>

          {/* Résumé */}
          <Link
            to="/resume"
            className={`nav-link ${isActive('/resume') ? 'active' : ''}`}
          >
            Résumé
          </Link>

          {/* Work Samples */}
          <Link
            to="/work-samples"
            className={`nav-link ${isActive('/work-samples') ? 'active' : ''}`}
          >
            Work Samples
          </Link>

          {/* Owner sign-in (non-blocking, off to the side) */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <span title={user.email} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOwner ? '#10B981' : 'var(--text-muted)' }} />
                {user.display_name || user.email.split('@')[0]}
              </span>
              <button onClick={logout} className="nav-link" style={{ fontSize: '12px', opacity: 0.75 }}>
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => setSignInOpen(true)} className="nav-link" style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                <path d="M6 2H3v12h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign in
            </button>
          )}

        </div>

        {/* Mobile toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none' }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 20px 20px',
        }}>
          <Link to="/" className="nav-link" style={{ display: 'block', padding: '12px 0' }}>
            Home
          </Link>
          <Link to="/apps" className="nav-link" style={{ display: 'block', padding: '12px 0' }}>
            Apps
          </Link>
          <Link to="/experience" className="nav-link" style={{ display: 'block', padding: '12px 0' }}>
            Experience
          </Link>
          <Link to="/resume" className="nav-link" style={{ display: 'block', padding: '12px 0' }}>
            Résumé
          </Link>
          <Link to="/work-samples" className="nav-link" style={{ display: 'block', padding: '12px 0' }}>
            Work Samples
          </Link>
          {user ? (
            <button
              className="nav-link"
              style={{ display: 'block', padding: '12px 0', textAlign: 'left', width: '100%' }}
              onClick={() => { logout(); setMobileOpen(false) }}
            >
              Sign out ({user.display_name || user.email.split('@')[0]})
            </button>
          ) : (
            <button
              className="nav-link"
              style={{ display: 'block', padding: '12px 0', textAlign: 'left', width: '100%' }}
              onClick={() => { setSignInOpen(true); setMobileOpen(false) }}
            >
              Sign in
            </button>
          )}
        </div>
      )}

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </nav>
  )
}
