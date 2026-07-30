import { NavLink } from 'react-router-dom'

function SiteNav() {
  return (
    <nav className="site-nav">
      <NavLink to="/" end className="site-nav-brand">
        PROJECT EDEN
      </NavLink>
      <div className="site-nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Home
        </NavLink>
        <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Customs
        </NavLink>
        <NavLink to="/server" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Server
        </NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Portfolio
        </NavLink>
        <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Pricing
        </NavLink>
        <a href="#discord">Discord</a>
      </div>
      <a href="#discord" className="site-nav-join">
        Join Discord
      </a>
    </nav>
  )
}

export default SiteNav
