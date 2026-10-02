import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import logoImg from '../assets/ProjectEden2.png'
import { useAuth } from '../context/AuthContext'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

function SiteNav() {
  const { user, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  // Features is a section of the Server page, so it owns the highlight there
  const onFeatures = location.pathname === '/server' && location.hash === '#features'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <nav className="site-nav">
      <NavLink to="/" end className="site-nav-brand">
        <span className="site-nav-brand-ring">
          <img src={logoImg} alt="" className="site-nav-brand-logo" />
        </span>
        <span className="site-nav-brand-text">
          <span className="site-nav-brand-title">PROJECT EDEN</span>
        </span>
      </NavLink>

      <button
        type="button"
        className={`site-nav-toggle${menuOpen ? ' is-open' : ''}`}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="site-nav-toggle-bar" />
        <span className="site-nav-toggle-bar" />
        <span className="site-nav-toggle-bar" />
      </button>

      <div className={`site-nav-menu${menuOpen ? ' is-open' : ''}`}>
        <div className="site-nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Home
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Models
          </NavLink>
          <NavLink to="/server" className={({ isActive }) => (isActive && !onFeatures ? 'active' : undefined)}>
            Server
          </NavLink>
          <Link to="/server#features" className={onFeatures ? 'active' : undefined}>
            Features
          </Link>
          {user && (
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Orders
            </NavLink>
          )}
          {profile?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Admin
            </NavLink>
          )}
        </div>
        <div className="site-nav-actions">
          {/* signing in is optional (only needed to buy), so signed-out is a
              neutral state, not an error */}
          <Link to={user ? '/profile' : '/login'} className={`site-nav-status ${user ? 'is-ok' : 'is-idle'}`}>
            <span className="site-nav-status-dot" />
            {user ? 'Signed in' : 'Sign in'}
          </Link>
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="site-nav-join">
            Join Discord
          </a>
        </div>
      </div>
    </nav>
  )
}

export default SiteNav
