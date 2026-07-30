import HeroPanel from '../components/HeroPanel'
import './ComingSoonPage.css'

function ComingSoonPage({ eyebrow, title, body }) {
  return (
    <div className="coming-soon-page">
      <header className="hero">
        <HeroPanel>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="coming-soon-title">{title}</h1>
          <p className="tagline">{body}</p>
          <p className="coming-soon-hint">More coming soon.</p>
        </HeroPanel>
      </header>
    </div>
  )
}

export default ComingSoonPage
