import { NavLink, Link } from 'react-router-dom'
import logoImg from '../assets/ProjectEden2.png'
import { useAuth } from '../context/AuthContext'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

function SiteNav() {
  const { user } = useAuth()

  return (
    <nav className="site-nav">
      <NavLink to="/" end className="site-nav-brand">
        <span className="site-nav-brand-ring">
          <img src={logoImg} alt="" className="site-nav-brand-logo" />
        </span>
        <span className="site-nav-brand-text">
          <span className="site-nav-brand-title">PROJECT EDEN</span>
          <span className="site-nav-brand-sub">プロジェクト・エデン</span>
        </span>
      </NavLink>
      <div className="site-nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Home
        </NavLink>
        <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Models
        </NavLink>
        <NavLink to="/server" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Server
        </NavLink>
        <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Pricing
        </NavLink>
        <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Discord</a>
      </div>
      <div className="site-nav-actions">
        <span className={`site-nav-status ${user ? 'is-ok' : 'is-error'}`}>
          <span className="site-nav-status-dot" />
          Status: {user ? 'Connected' : 'Error'}
        </span>
        {user ? (
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav-join"
          >
            Join Discord
          </a>
        ) : (
          <Link to="/login" className="site-nav-join">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}

export default SiteNav
