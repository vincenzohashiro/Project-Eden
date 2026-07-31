import { NavLink } from 'react-router-dom'
import logoImg from '../assets/ProjectEden2.png'

function SiteNav() {
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
        <a href="https://discord.gg/mEhgkyUxTF" target="_blank" rel="noopener noreferrer">Discord</a>
      </div>
      <a href="https://discord.gg/mEhgkyUxTF" target="_blank" rel="noopener noreferrer" className="site-nav-join">
        Join Discord
      </a>
    </nav>
  )
}

export default SiteNav
