import logoBase from './assets/ProjectEden2.png'
import logoAlt1 from './assets/ProjectEden1.png'
import logoAlt2 from './assets/SpecializedRed.png'
import cityImg from './assets/8-bit-graphics-pixels-scene-with-city-night.jpg'
import './App.css'

const FEATURES = [
  {
    index: '01',
    title: 'Survival',
    body: 'Vanilla-plus survival with custom loot tiers, hardened mobs, and rare biome events.',
  },
  {
    index: '02',
    title: 'Factions',
    body: 'Claim territory, forge alliances, and defend your outpost from raiders across the wasteland.',
  },
  {
    index: '03',
    title: 'Events',
    body: 'Weekly community events, boss raids, and seasonal storylines shaped by player choices.',
  },
]

function App() {
  return (
    <div className="site">
      <div className="site-bg" aria-hidden="true">
        <span className="site-corner tl" />
        <span className="site-corner tr" />
        <span className="site-corner bl" />
        <span className="site-corner br" />

        <div className="city" style={{ '--city-url': `url(${cityImg})` }}>
          <div className="city-photo" />
          <div className="city-glow" />
          <div className="city-haze" />

          <div className="maglev">
            <span className="maglev-pulse p1" />
            <span className="maglev-pulse p2" />
          </div>

          <div className="traffic">
            <span className="car c1" />
            <span className="car c2" />
            <span className="car c3" />
            <span className="car c4" />
            <span className="car c5" />
            <span className="car c6" />
          </div>
        </div>
      </div>

      <header className="hero">
        <div className="hero-panel">
          <span className="hero-corner tl" aria-hidden="true" />
          <span className="hero-corner br" aria-hidden="true" />
          <span className="panel-glitch g1" aria-hidden="true" />
          <span className="panel-glitch g2" aria-hidden="true" />
          <div className="hero-content">
            <span className="eyebrow">MINECRAFT SURVIVAL SERVER</span>
            <h1>
              <span className="logo-wrap">
                <img className="logo-img base" src={logoBase} alt="Project Eden" />
                <img className="logo-img alt1" src={logoAlt1} alt="" aria-hidden="true" />
                <img className="logo-img alt2" src={logoAlt2} alt="" aria-hidden="true" />
              </span>
            </h1>
            <p className="tagline">
              Survive the wreckage. Rebuild the colony. Ascend together.
            </p>

            <div className="server-status">
              <span className="status-dot" />
              <span className="status-label">ONLINE</span>
              <span className="status-sep">/</span>
              <span className="status-players">128 / 200 players</span>
            </div>

            <div className="hero-actions">
              <button type="button" className="btn btn-primary">
                <span className="ip">play.projecteden.net</span>
                <span className="btn-hint">Click to copy</span>
              </button>
              <a className="btn btn-ghost" href="#discord">
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="features">
        {FEATURES.map((feature) => (
          <div className="feature-card" key={feature.index}>
            <span className="feature-index">{feature.index}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </div>
        ))}
      </section>

      <footer className="site-footer">
        <span>&copy; {new Date().getFullYear()} Project Eden</span>
        <nav className="footer-links">
          <a href="#discord">Discord</a>
          <a href="#wiki">Wiki</a>
          <a href="#store">Store</a>
        </nav>
      </footer>
    </div>
  )
}

export default App
