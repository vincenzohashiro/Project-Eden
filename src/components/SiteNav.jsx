import { NavLink } from 'react-router-dom'

function SiteNav() {
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
      </div>
    </nav>
  )
}

export default SiteNav
