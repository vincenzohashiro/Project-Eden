import { Link } from 'react-router-dom'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>&copy; {new Date().getFullYear()} Project Eden</span>
      <nav className="footer-links">
        <a href="#discord">Discord</a>
        <a href="#wiki">Wiki</a>
        <Link to="/shop">Store</Link>
      </nav>
    </footer>
  )
}

export default SiteFooter
