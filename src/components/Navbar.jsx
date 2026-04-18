import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apps } from '../data/apps'

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
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
              {apps.slice(0, 5).map(app => (
                <a
                  key={app.id}
                  href={app.href}
                  className="dropdown-item"
                  target={app.href !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span
                    className="dropdown-item-dot"
                    style={{ background: app.color }}
                  />
                  <div className="dropdown-item-info">
                    <div className="dropdown-item-name">{app.title}</div>
                    <div className="dropdown-item-desc">{app.description}</div>
                  </div>
                </a>
              ))}
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
            <svg viewBox="0 0 12 12" width="11" height="11" fill="none" style={{ color: 'var(--text-muted)' }}>
              <path d="M2.5 9.5l7-7M4 2.5h5.5v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

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
        </div>
      )}
    </nav>
  )
}
