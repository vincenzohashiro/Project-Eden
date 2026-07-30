import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SiteNav() {
  const { user, profile, loading } = useAuth()

  const displayName = profile?.username || user?.user_metadata?.full_name || 'Account'
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <nav className="site-nav">
      <NavLink to="/" end className="site-nav-brand">
        PROJECT EDEN
      </NavLink>
      <div className="site-nav-links">
        <NavLink
          to="/server"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Minecraft Server
        </NavLink>
        <NavLink
          to="/shop"
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          Model Shop
        </NavLink>
        {!loading && (
          user ? (
            <NavLink
              to="/profile"
              className={({ isActive }) => `site-nav-account${isActive ? ' active' : ''}`}
            >
              {avatarUrl ? (
                <img className="site-nav-avatar" src={avatarUrl} alt={displayName} />
              ) : (
                <span className="site-nav-avatar site-nav-avatar-fallback">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
              {displayName}
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Login
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}

export default SiteNav
