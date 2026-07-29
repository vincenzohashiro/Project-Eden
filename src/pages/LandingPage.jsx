import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import specializedLogo from '../assets/SpecializedRed.png'
import { PRODUCTS } from '../data/products'
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

function LandingPage() {
  return (
    <>
      {/* section 1: hero */}
      <section className="landing-hero">
        <span className="hero-corner tl" aria-hidden="true" />
        <span className="hero-corner br" aria-hidden="true" />

        <Reveal className="landing-hero-inner">
          <div className="hero-float">
            <span className="thruster-flame" aria-hidden="true" />
            <span className="thruster-glow" aria-hidden="true" />

            <span className="landing-readout">
              SIGNAL LOCKED · TWO NETWORKS DETECTED
            </span>
            <span className="eyebrow">PROJECT EDEN</span>
            <h1 className="landing-title">
              Two Worlds.
              <br />
              One Connection.
            </h1>
            <p className="landing-lede">
              A custom Minecraft server and the model shop that builds it —
              one universe of custom content, two ways to experience it.
            </p>
            <span className="scroll-cue">Scroll to explore ↓</span>
          </div>
        </Reveal>
      </section>

      {/* section 2: showcase */}
      <section className="showcase">
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
