import { Link } from 'react-router-dom'
import logoImg from '../assets/ProjectEden2.png'
import Reveal from './Reveal'

// Placeholders until real Discord "Verified Buyers" role members and
// partner links/logos are wired in.
const VERIFIED_BUYERS = [
  'NovaPixel_',
  'ShadowCrafter92',
  'EmberWolfe',
  'Kryptic_Void',
  'AshenRogue',
  'LunarByte',
]

const PARTNERS = [{ name: 'Valthorne SMP', url: '#' }]

const ShopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M3.5 9 5 4h14l1.5 5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 9h17V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V9z" strokeLinejoin="round" />
    <path d="M9 13a3 3 0 0 0 6 0" strokeLinecap="round" />
  </svg>
)

const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path
      d="M4 18v-1.6c0-2 3-3.4 6-3.4s6 1.4 6 3.4V18"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="7.5" r="3" />
    <path d="M16 8.2c1.8.3 3.5 1.4 3.5 3v1.2" strokeLinecap="round" />
    <circle cx="16.5" cy="5.8" r="2.2" />
  </svg>
)

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v6" strokeLinecap="round" />
    <circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

const CHAR_TYPE_SECONDS = 0.07
const TYPE_GAP_SECONDS = 0.15

const DiscordIcon = () => (
  <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
    <path d="M60.105 4.898A58.549 58.549 0 0 0 45.653.415a.22.22 0 0 0-.233.11 40.784 40.784 0 0 0-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 0 0-.233-.11 58.386 58.386 0 0 0-14.451 4.483.207.207 0 0 0-.095.082C1.578 18.073-.944 30.786.293 43.331a.244.244 0 0 0 .093.167c6.073 4.461 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42.08 42.08 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 38.772 38.772 0 0 1-5.539-2.636.228.228 0 0 1-.022-.378 31.17 31.17 0 0 0 1.1-.862.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 0 1 .233.027c.356.292.728.586 1.102.865a.228.228 0 0 1-.02.378 36.384 36.384 0 0 1-5.54 2.634.227.227 0 0 0-.121.315 47.249 47.249 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.5 17.757-8.961a.228.228 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.351a.18.18 0 0 0-.093-.084zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.437 3.24 6.38 7.156 0 3.945-2.827 7.156-6.38 7.156zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.827 7.156-6.38 7.156z" />
  </svg>
)

function SiteFooter() {
  let cumulativeDelay = 0
  const buyerTimings = VERIFIED_BUYERS.map((name, index) => {
    const text = index === VERIFIED_BUYERS.length - 1 ? name : `${name}, `
    const duration = Math.max(text.length * CHAR_TYPE_SECONDS, 0.3)
    const timing = { text, delay: cumulativeDelay, duration }
    cumulativeDelay += duration + TYPE_GAP_SECONDS
    return timing
  })

  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div className="site-footer-row site-footer-row-primary">
          <div className="site-footer-brand-card">
            <div className="site-footer-brand">
              <div className="site-footer-brand-row">
                <span className="site-footer-logo">
                  <img src={logoImg} alt="" />
                </span>
                <span className="site-footer-brand-text">
                  <span className="site-footer-title">PROJECT EDEN</span>
                  <span className="site-footer-brand-sub">プロジェクト・エデン</span>
                </span>
              </div>
              <p className="site-footer-tagline">
                Two worlds, One connection. A shop and A Server in one website.
              </p>
              <a href="https://discord.gg/mEhgkyUxTF" target="_blank" rel="noopener noreferrer" className="site-footer-social" aria-label="Discord">
                <DiscordIcon />
              </a>
            </div>

            <div className="site-footer-links-grid">
              <div className="site-footer-col site-footer-col-shop">
                <span className="site-footer-col-title">
                  <ShopIcon />
                  Shop
                </span>
                <span className="site-footer-col-underline" />
                <Link to="/shop">Model Shop</Link>
                <Link to="/pricing">Pricing</Link>
              </div>

              <div className="site-footer-col site-footer-col-community">
                <span className="site-footer-col-title">
                  <CommunityIcon />
                  Community
                </span>
                <span className="site-footer-col-underline" />
                <a href="https://discord.gg/mEhgkyUxTF" target="_blank" rel="noopener noreferrer">Discord Server</a>
                <Link to="/server">Server</Link>
              </div>

              <div className="site-footer-col site-footer-col-info">
                <span className="site-footer-col-title">
                  <InfoIcon />
                  Info
                </span>
                <span className="site-footer-col-underline" />
                <Link to="/reviews">Reviews</Link>
                <Link to="/qa">FAQ</Link>
              </div>
            </div>
          </div>

          <div className="site-footer-partners-card">
            <span className="site-footer-partners-title">Our Partners</span>

            <div className="site-footer-partners-block">
              <span className="site-footer-col-subtitle">Partner Servers</span>
              <div className="site-footer-partner-badges">
                {PARTNERS.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer-partner-badge"
                  >
                    <span className="site-footer-partner-badge-icon">
                      {partner.name.charAt(0)}
                    </span>
                    {partner.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="site-footer-partners-block">
              <span className="site-footer-col-subtitle">Verified Buyers</span>
              <Reveal className="site-footer-buyer-line" direction="up">
                {buyerTimings.map(({ text, duration, delay }) => (
                  <span
                    key={text}
                    className="site-footer-buyer-type"
                    style={{
                      '--type-width': `${text.length}ch`,
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay}s`,
                      animationTimingFunction: `steps(${text.length}, end)`,
                    }}
                  >
                    {text}
                  </span>
                ))}
                <span className="site-footer-buyer-cursor" aria-hidden="true" />
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span className="site-footer-copy">
          &copy; {new Date().getFullYear()} Project Eden. All rights reserved.
        </span>
        <span className="site-footer-note">Made With &hearts; For The Community</span>
      </div>
    </footer>
  )
}

export default SiteFooter
