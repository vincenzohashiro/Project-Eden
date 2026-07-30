import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/ProjectEden2.png'
import cityImg from '../assets/360_F_705636748_af4V5ljPnQoZZads77zlxhdeyyBXFVLD.jpg'
import pokeFrameGif from '../assets/PokeFrame.gif'
import zenithSwordGif from '../assets/zenith_sword_terarria.gif'
import { fetchDiscordStatus } from '../lib/discordStatus'
import './LandingPageTest.css'

const DiscordIcon = () => (
  <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
    <path d="M60.105 4.898A58.549 58.549 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.073-.944 30.786.293 43.331a.244.244 0 0 0 .093.167c6.073 4.461 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.636.228.228 0 0 1-.022-.378 31.17 31.17 0 0 0 1.1-.862.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .233.027c.356.292.728.586 1.102.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.634.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.5 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.351a.18.18 0 0 0-.093-.084zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.437 3.24 6.38 7.156 0 3.945-2.827 7.156-6.38 7.156zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.827 7.156-6.38 7.156z" />
  </svg>
)

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <path d="M2.5 3h2.4L7.6 14.6h10.2L20.5 6H5.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
    <path d="M14 2.5V7h4M8 12h8M8 16h8" strokeLinecap="round" />
  </svg>
)

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
)

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M3.5 7 12 3l8.5 4-8.5 4-8.5-4z" strokeLinejoin="round" />
    <path d="M3.5 7v10L12 21l8.5-4V7M12 11v10" strokeLinejoin="round" />
  </svg>
)

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M9 8 4.5 12 9 16M15 8l4.5 4-4.5 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" />
  </svg>
)

const SwordIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M20 3 8.5 14.5M20 3l-3.2.4L16 6.6 13.4 6l-.4 3.2L11.5 9.9M3 21l4.2-1.1L8.5 14.5M3 21l1.1-4.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M3 14h9v-3H8V8h9v3h3v3h-2v3h-4v-3H9v3H5v-3H3z" strokeLinejoin="round" />
  </svg>
)

const GolemIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="8" y="3" width="8" height="7" rx="1" />
    <rect x="5" y="11" width="14" height="7" rx="1" />
    <path d="M5 13H2v4h3M19 13h3v4h-3" strokeLinecap="round" />
  </svg>
)

const PickaxeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M4 6c4-3 12-3 16 0-3 1.5-5 3.6-6.4 6.4L11 10 4 6z" strokeLinejoin="round" />
    <path d="M11 10 4 20" strokeLinecap="round" />
  </svg>
)

const FEATURE_ICONS = {
  economy: BoltIcon,
  quests: DocIcon,
  items: BoxIcon,
  bosses: SwordIcon,
  shops: CartIcon,
  community: ListIcon,
}

const SMP_FEATURES = [
  ['economy', 'Economy'],
  ['quests', 'Quests'],
  ['items', 'Custom Items'],
  ['bosses', 'Custom Bosses'],
  ['shops', 'Player Shops'],
  ['community', 'Active Community'],
]

const WAVE_HEIGHTS = [
  6, 10, 16, 22, 14, 8, 18, 26, 12, 20, 30, 16, 10, 22, 28, 14, 8, 18, 24, 12,
]

function LandingPageTest() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchDiscordStatus().then((s) => {
      if (!cancelled) setStatus(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const isLive = status?.presenceCount != null
  const players = isLive ? status.presenceCount : 87
  const maxPlayers = 250

  return (
    <div className="lt-page">
      <header className="lt-nav">
        <Link to="/" className="lt-brand">
          <span className="lt-brand-ring">
            <img src={logoImg} alt="" className="lt-brand-logo" />
          </span>
          <span className="lt-brand-text">
            <span className="lt-brand-title">PROJECT EDEN</span>
            <span className="lt-brand-sub">プロジェクト・エデン</span>
          </span>
        </Link>

        <nav className="lt-links">
          <Link className="active" to="/">Home</Link>
          <Link to="/shop">Customs</Link>
          <Link to="/server">Server</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/pricing">Pricing</Link>
          <a href="#discord">Discord</a>
        </nav>

        <a href="#discord" className="lt-discord-btn">
          <DiscordIcon />
          Join Discord
        </a>
      </header>

      <section className="lt-hero">
        <div className="lt-panel lt-panel-customs" id="customs">
          <span className="lt-tag lt-tag-red">
            <span className="lt-tag-num">01</span>
            <span className="lt-tag-sep">&rsaquo;</span>
            EDEN SPECIALIZED
          </span>

          <div className="lt-panel-body">
            <div className="lt-panel-copy">
              <h1 className="lt-wordmark">
                <span className="lt-word-white">Eden</span>
                <span className="lt-word-red">Specialized</span>
              </h1>
              <p className="lt-subhead">Premium Minecraft Custom Models</p>
              <p className="lt-desc">
                High quality, optimized, and unique custom item models to
                upgrade your server experience.
              </p>

              <div className="lt-actions">
                <Link to="/shop" className="lt-btn lt-btn-fill lt-red">
                  <CartIcon />
                  Browse Store
                </Link>
                <Link to="/shop" className="lt-btn lt-btn-outline lt-red">
                  <DocIcon />
                  How to Order
                </Link>
              </div>

              <div className="lt-tagrow">
                <span><BoxIcon /> Custom Models</span>
                <span><DocIcon /> Resource Packs</span>
                <span><CodeIcon /> CustomModelData</span>
                <span><BoltIcon /> Fast Delivery</span>
              </div>
            </div>

            <div className="lt-panel-art lt-art-customs">
              <div className="lt-art-models">
                <div className="lt-art-model">
                  <img src={pokeFrameGif} alt="Poke Ball display frame custom model" />
                  <em>Poke Ball Frame</em>
                </div>
                <div className="lt-art-model">
                  <img src={zenithSwordGif} alt="Zenith sword custom model" />
                  <em>Zenith Sword</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lt-panel lt-panel-smp" id="smp">
          <span className="lt-tag lt-tag-green">
            <span className="lt-tag-num">02</span>
            <span className="lt-tag-sep">&rsaquo;</span>
            PROJECT EDEN SMP
          </span>

          <div className="lt-panel-body lt-panel-body-smp">
            <div className="lt-panel-copy">
              <h1 className="lt-wordmark">
                <span className="lt-word-white">Project</span>
                <span className="lt-word-green">Eden SMP</span>
              </h1>
              <p className="lt-subhead">Experience The Models In-Game</p>
              <p className="lt-desc">
                Join our cyberpunk Minecraft SMP where custom items come to
                life. Build. Explore. Fight. Thrive.
              </p>

              <div className="lt-actions">
                <a href="#discord" className="lt-btn lt-btn-fill lt-green">
                  <ArrowIcon />
                  Join Server
                </a>
                <Link to="/server" className="lt-btn lt-btn-outline lt-green">
                  <ListIcon />
                  View Features
                </Link>
              </div>
            </div>

            <div
              className="lt-panel-art lt-art-smp"
              style={{ '--city-url': `url(${cityImg})` }}
            >
              <div className="lt-art-photo" />
              <div className="lt-art-tint" />
              <em>In-Game</em>
            </div>

            <div className="lt-panel-status">
              <div className="lt-status-block">
                <span className="lt-status-title">Server Status</span>
                <span className="lt-status-online">
                  <span className="status-dot" /> Online
                </span>
                <span className="lt-status-value">{players} / {maxPlayers}</span>
                <span className="lt-status-label">Players Online</span>
                <span className="lt-status-value">Eden City</span>
                <span className="lt-status-label">Map</span>
                <span className="lt-status-value">1.20.4</span>
                <span className="lt-status-label">Version</span>
              </div>

              <div className="lt-status-block">
                <span className="lt-status-title">Server Features</span>
                <ul className="lt-feature-list">
                  {SMP_FEATURES.map(([key, label]) => {
                    const Icon = FEATURE_ICONS[key]
                    return (
                      <li key={key}>
                        <Icon /> {label}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>

          <span className="lt-thruster left" aria-hidden="true">
            <span className="lt-thruster-flame" />
            <span className="lt-thruster-glow" />
          </span>
          <span className="lt-thruster right" aria-hidden="true">
            <span className="lt-thruster-flame" />
            <span className="lt-thruster-glow" />
          </span>
        </div>
      </section>

      <section className="lt-explore" id="explore">
        <span className="lt-explore-eyebrow">Explore Eden</span>

        <div className="lt-explore-grid">
          <Link to="/shop" className="lt-card">
            <span className="lt-card-icon"><BoxIcon /></span>
            <h3>Featured Models</h3>
            <div className="lt-card-body">
              <div className="lt-card-thumbs">
                <span className="lt-thumb"><SwordIcon /></span>
                <span className="lt-thumb"><GunIcon /></span>
                <span className="lt-thumb"><GolemIcon /></span>
                <span className="lt-thumb"><PickaxeIcon /></span>
              </div>
              <p>Check out our latest custom models made for your server.</p>
            </div>
            <span className="lt-card-link">View All Models <ArrowIcon /></span>
          </Link>

          <Link to="/server" className="lt-card">
            <span className="lt-card-icon"><DocIcon /></span>
            <h3>Server Features</h3>
            <div className="lt-card-body">
              <span
                className="lt-card-photo"
                style={{ backgroundImage: `url(${cityImg})` }}
              />
              <p>Unique systems, engaging mechanics, and endless possibilities.</p>
            </div>
            <span className="lt-card-link">Discover More <ArrowIcon /></span>
          </Link>

          <Link to="/reviews" className="lt-card">
            <span className="lt-card-icon lt-quote">&ldquo;</span>
            <h3>Customer Reviews</h3>
            <div className="lt-card-body">
              <p>
                &ldquo;Amazing quality and fast delivery! The models are
                detailed and work perfectly in-game.&rdquo;
              </p>
              <span className="lt-card-review">
                - NovaPixel_ <span className="lt-stars">★★★★★</span>
              </span>
            </div>
            <span className="lt-card-link">Read More Reviews <ArrowIcon /></span>
          </Link>

          <Link to="/qa" className="lt-card">
            <span className="lt-card-icon">?</span>
            <h3>Frequently Asked Questions</h3>
            <div className="lt-card-body">
              <p>Find answers to common questions about orders and the server.</p>
            </div>
            <span className="lt-card-link">View FAQ <ArrowIcon /></span>
          </Link>
        </div>
      </section>

      <footer className="lt-footer">
        <span className="lt-footer-copy">
          Project Eden &copy; {new Date().getFullYear()}
          <br />
          All Rights Reserved
        </span>

        <div className="lt-waveform">
          <span className="lt-wave-bars">
            {WAVE_HEIGHTS.map((h, i) => (
              <span key={i} className="lt-wave-bar" style={{ '--h': `${h}px` }} />
            ))}
          </span>
          <span className="lt-wave-icon"><img src={logoImg} alt="" /></span>
          <span className="lt-wave-bars">
            {WAVE_HEIGHTS.slice().reverse().map((h, i) => (
              <span key={i} className="lt-wave-bar" style={{ '--h': `${h}px` }} />
            ))}
          </span>
        </div>

        <span className="lt-footer-note">Made With &hearts; For The Community</span>
      </footer>
    </div>
  )
}

export default LandingPageTest
