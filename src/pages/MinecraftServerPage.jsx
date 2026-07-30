import { useEffect, useState } from 'react'
import HeroPanel from '../components/HeroPanel'
import GlitchLogo from '../components/GlitchLogo'
import { fetchDiscordStatus } from '../lib/discordStatus'
import './MinecraftServerPage.css'

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

function MinecraftServerPage() {
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
    <div className="server-page">
      <header className="hero">
        <HeroPanel>
          <span className="eyebrow">MINECRAFT SURVIVAL SERVER</span>
          <h1>
            <GlitchLogo />
          </h1>
          <p className="tagline">
            Survive the wreckage. Rebuild the colony. Ascend together.
          </p>

          <div className="server-status">
            <span className={`status-dot${online ? '' : ' offline'}`} />
            <span className="status-label">{online ? 'ONLINE' : 'OFFLINE'}</span>
            <span className="status-sep">/</span>
            <span className="status-players">
              {isLive
                ? `${status.presenceCount} online · ${status.memberCount} members`
                : '128 / 200 players'}
            </span>
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
        </HeroPanel>
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
    </div>
  )
}

export default MinecraftServerPage
