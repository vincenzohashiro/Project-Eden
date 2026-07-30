import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import specializedLogo from '../assets/SpecializedRed.png'
import { PRODUCTS } from '../data/products'
import { fetchDiscordStatus } from '../lib/discordStatus'
import './LandingPage.css'

function ShotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.2" />
      <circle cx="8" cy="10" r="1.6" />
      <path d="M2.5 16.5 8.5 12l3.5 3 4-3.5 5.5 4.5" />
    </svg>
  )
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 2 20 6.5V17.5L12 22 4 17.5V6.5Z" />
      <path d="M12 2v20" />
      <path d="M4 6.5 12 11l8-4.5" />
    </svg>
  )
}

function LandingPage() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchDiscordStatus().then((data) => {
      if (!cancelled) setStatus(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const isLive = status?.memberCount != null && status?.presenceCount != null
  const online = status?.online ?? true

  return (
    <>
      {/* first screen: hero + explore, fit together in one viewport */}
      <div className="landing-fold">
      {/* section 1: hero — Eden Specialized / Minecraft Server, two separate panels */}
      <section className="eden-hero">
        <Reveal direction="left" className="eden-hero-panel eden-hero-specialized">
          <div className="eden-hero-sp-body">
            <div className="eden-hero-sp-left">
              <span className="eden-hero-sp-eyebrow">Project</span>
              <h2 className="eden-hero-sp-logo">Eden</h2>
              <span className="eden-hero-sp-sub">Specialized</span>
              <span className="eden-hero-accent-line" aria-hidden="true" />

              <div className="eden-hero-sp-row">
                <p className="eden-hero-description">
                  Premium custom Minecraft models — player skins, mob
                  reworks, and builds crafted to spec for your world.
                </p>

                <div className="eden-hero-sp-actions">
                  <span className="eden-hero-tick" aria-hidden="true" />
                  <Link to="/shop" className="btn btn-sp eden-hero-btn-sm">
                    Browse Store
                  </Link>
                  <a href="#discord" className="btn btn-sp-outline eden-hero-btn-sm">
                    How to Order
                  </a>
                </div>
              </div>
            </div>

            <div className="eden-hero-sp-right">
              <div className="eden-hero-sp-images">
                <span className="eden-hero-3d-tile">
                  <ShotIcon />
                  <em>3D Image</em>
                </span>
                <span className="eden-hero-3d-tile">
                  <ShotIcon />
                  <em>3D Image</em>
                </span>
                <span className="eden-hero-3d-tile">
                  <ShotIcon />
                  <em>3D Image</em>
                </span>
                <span className="eden-hero-3d-tile">
                  <ShotIcon />
                  <em>3D Image</em>
                </span>
              </div>
            </div>
          </div>

          <div className="eden-hero-tagbar">
            <Link to="/shop">Custom Models</Link>
            <span className="tag-sep">|</span>
            <Link to="/shop">Resource Pack</Link>
            <span className="tag-sep">|</span>
            <a href="#discord">Fast Delivery</a>
          </div>
        </Reveal>

        <Reveal direction="right" delay={120} className="eden-hero-panel eden-hero-server">
          <div className="eden-hero-srv-body">
            <div className="eden-hero-srv-left">
              <div className="eden-hero-srv-heading">
                <span className="eden-hero-srv-eyebrow">Project</span>
                <h2 className="eden-hero-srv-logo">Eden</h2>
                <span className="eden-hero-srv-sub">Server</span>
              </div>

              <div className="eden-hero-actions">
                <a href="#discord" className="btn btn-primary eden-hero-btn-sm">
                  Join Server
                </a>
                <Link to="/server" className="btn btn-ghost eden-hero-btn-sm">
                  View Features
                </Link>
              </div>

              <div className="eden-hero-lines">
                <span>
                  <span className={`status-dot${online ? '' : ' offline'}`} /> Server Stats
                </span>
                <span>{isLive ? `${status.presenceCount} Online Players` : 'Online Players'}</span>
              </div>
            </div>

            <div className="eden-hero-srv-middle">
              <div className="eden-hero-3d-model">
                <span className="eden-hero-3d-spin">
                  <CubeIcon />
                </span>
                <em>3D Rotating Model</em>
              </div>
            </div>

            <div className="eden-hero-srv-right">
              <div className="eden-hero-srv-status">
                <span className="srv-box-title">Server Status</span>

                <div className="srv-stat">
                  <span className="srv-stat-value">
                    <span className={`status-dot${online ? '' : ' offline'}`} />
                    {online ? 'Online' : 'Offline'}
                  </span>
                  <span className="srv-stat-label">Status</span>
                </div>

                <div className="srv-stat">
                  <span className="srv-stat-value">{isLive ? status.presenceCount : 0}/100</span>
                  <span className="srv-stat-label">Players Online</span>
                </div>

                <div className="srv-stat">
                  <span className="srv-stat-value">1.21.11 Fabric</span>
                  <span className="srv-stat-label">Version Build</span>
                </div>

                <div className="srv-stat">
                  <span className="srv-stat-value">Babylon</span>
                  <span className="srv-stat-label">World</span>
                </div>
              </div>

              <div className="eden-hero-srv-features">
                <span className="srv-box-title">Server Features</span>
                <ul className="srv-feature-list">
                  <li>Realtime Economy</li>
                  <li>Quests</li>
                  <li>Shops</li>
                  <li>Bosses</li>
                  <li>Parkour</li>
                </ul>
              </div>
            </div>
          </div>

          <span className="eden-hero-thruster left" aria-hidden="true">
            <span className="eden-hero-thruster-flame" />
            <span className="eden-hero-thruster-glow" />
          </span>
          <span className="eden-hero-thruster right" aria-hidden="true">
            <span className="eden-hero-thruster-flame" />
            <span className="eden-hero-thruster-glow" />
          </span>
        </Reveal>
      </section>

      {/* section 1b: explore eden */}
      <Reveal as="section" direction="up" className="explore-section">
        <span className="eyebrow explore-eyebrow">EXPLORE EDEN</span>
        <div className="explore-grid">
          <Link to="/shop" className="explore-card">
            <span className="explore-card-icon">◇</span>
            <h3>Featured Models</h3>
            <div className="explore-thumb-row">
              <span className="avatar a1">
                <span className="avatar-online" aria-hidden="true" />
              </span>
              <span className="avatar a2" />
              <span className="avatar a3" />
              <span className="avatar a4" />
              <span className="avatar more">+12</span>
            </div>
            <span className="landing-cta">View All Models &rarr;</span>
          </Link>

          <Link to="/server" className="explore-card">
            <span className="explore-card-icon">◇</span>
            <h3>Server Features</h3>
            <span className="shot-placeholder explore-thumb">
              <ShotIcon />
              <em>Image</em>
            </span>
            <span className="landing-cta">Discover More &rarr;</span>
          </Link>

          <Link to="/reviews" className="explore-card">
            <span className="explore-card-icon">&ldquo;</span>
            <h3>Customer Reviews</h3>
            <p className="explore-card-lines">
              What players and clients are saying about Project Eden.
            </p>
            <span className="explore-stars">★★★★★</span>
            <span className="landing-cta">Read More &rarr;</span>
          </Link>

          <Link to="/qa" className="explore-card">
            <span className="explore-card-icon">?</span>
            <h3>Frequently Asked Questions</h3>
            <p className="explore-card-lines">
              Common questions about the server and the shop.
            </p>
            <span className="landing-cta">View FAQ &rarr;</span>
          </Link>
        </div>
      </Reveal>
      </div>

      {/* section 2: showcase */}
      <section className="showcase" id="showcase">
        <div className="specialized-split">
          <Reveal direction="left" className="specialized-media">
            <span
              className="glitch-frame"
              style={{ '--glitch-url': `url(${specializedLogo})` }}
            >
              <img
                src={specializedLogo}
                alt="Project Eden Specialized"
                className="glitch-base"
              />
            </span>
          </Reveal>
          <Reveal direction="right" delay={120} className="specialized-copy">
            <span className="eyebrow sp-eyebrow">PROJECT EDEN — SPECIALIZED</span>
            <h2>Beyond the standard build</h2>
            <p>
              Our bespoke commission arm — one-off custom player models, mob
              reworks, and structures built to spec for creators who need
              something the catalog doesn't cover yet.
            </p>
            <a className="btn btn-sp" href="#discord">
              Request a commission
            </a>
          </Reveal>
        </div>

        <div className="section-divider" aria-hidden="true" />

        <div className="server-split">
          <Reveal direction="left" className="server-media">
            <span className="shot-placeholder lg">
              <ShotIcon />
              <em>Minecraft Screenshot</em>
            </span>
            <div className="server-media-row">
              <span className="shot-placeholder">
                <ShotIcon />
                <em>Minecraft Screenshot</em>
              </span>
              <span className="shot-placeholder">
                <ShotIcon />
                <em>Minecraft Screenshot</em>
              </span>
            </div>
          </Reveal>
          <Reveal direction="right" delay={120} className="server-copy">
            <span className="eyebrow">LIVE SHOWCASE</span>
            <h2>Minecraft Server</h2>
            <p>
              A living, breathing colony — every model in the shop first has
              to survive here.
            </p>
            <Link to="/server" className="btn btn-primary btn-lg">
              Play Now
            </Link>
          </Reveal>
        </div>

        <div className="section-divider" aria-hidden="true" />

        <Reveal className="shop-showcase">
          <div className="showcase-banner">
            <span className="eyebrow">CUSTOM MODEL SHOP</span>
            <h2>Wear the world you're building</h2>
            <p>Every model below is live in-game right now.</p>
          </div>

          <div className="features">
            {PRODUCTS.map((product, i) => (
              <Reveal
                as="div"
                direction="up"
                delay={i * 120}
                className="feature-card shop-card"
                key={product.index}
              >
                <span className="feature-index">{product.index}</span>
                <h2>{product.title}</h2>
                <p>{product.body}</p>
                <span className="shop-price">Coming soon</span>
              </Reveal>
            ))}
          </div>

          <div className="showcase-cta">
            <Link to="/shop" className="btn btn-ghost">
              Browse the shop &rarr;
            </Link>
          </div>
        </Reveal>
      </section>

      {/* section 3: discord */}
      <Reveal as="section" direction="scale" className="discord-cta" id="discord">
        <div className="discord-panel">
          <span className="hero-corner tl" aria-hidden="true" />
          <span className="hero-corner br" aria-hidden="true" />

          <span className="panel-thruster left" aria-hidden="true">
            <span className="panel-thruster-flame" />
            <span className="panel-thruster-glow" />
          </span>
          <span className="panel-thruster right" aria-hidden="true">
            <span className="panel-thruster-flame" />
            <span className="panel-thruster-glow" />
          </span>

          <span className="eyebrow">GOT QUESTIONS?</span>
          <h2>Join the Discord</h2>
          <p>
            Commissions, support, and the whole Project Eden community live
            there.
          </p>

          <div className="discord-avatars">
            <span className="avatar a1">
              <span className="avatar-online" aria-hidden="true" />
            </span>
            <span className="avatar a2" />
            <span className="avatar a3" />
            <span className="avatar a4" />
            <span className="avatar more">+2.4k</span>
          </div>

          <div className="discord-preview">
            <span className="preview-avatar" aria-hidden="true" />
            <div className="preview-body">
              <span className="preview-name">
                EdenBot <span className="preview-tag">APP</span>
              </span>
              <span className="preview-msg">
                ⚡ New commission slot just opened — first come, first served.
              </span>
            </div>
            <span className="preview-time">2m ago</span>
          </div>

          <div className="discord-typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span>Someone is typing…</span>
          </div>

          <div className="discord-stats">
            <span>
              <strong>2,400+</strong> members
            </span>
            <span className="stat-dot" aria-hidden="true" />
            <span>
              <strong>24/7</strong> support
            </span>
            <span className="stat-dot" aria-hidden="true" />
            <span>
              <strong>Live</strong> commission queue
            </span>
          </div>

          <a className="btn btn-ghost btn-lg" href="#discord">
            Join Discord
          </a>
        </div>
      </Reveal>
    </>
  )
}

export default LandingPage
