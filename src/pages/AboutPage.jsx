import Reveal from '../components/Reveal'
import './AboutPage.css'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

// accent: which side of Project Eden the role leans toward
const TEAM = [
  { name: 'Charmy67', roles: ['Owner', 'Model Artist'], accent: 'red' },
  { name: 'Vinnie', roles: ['System Developer', 'Full Stack Developer'], accent: 'green' },
  { name: 'IamBible', roles: ['Model Artist', 'Full Stack Developer'], accent: 'cyan' },
]

const trackPointer = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-hero">
        <span className="about-kicker">Project Eden</span>
        <h1>About us</h1>
        <p>
          Two worlds, one connection. Eden Specialized builds custom Minecraft models, skins, and
          resource pack assets, and Eden SMP is the server where you can see them in action.
        </p>
      </header>

      <Reveal as="section" className="about-block" direction="fade" aria-labelledby="team-title">
        <div className="about-head">
          <h2 id="team-title">The team</h2>
          <p>The people behind the models, the server, and this website.</p>
        </div>

        <ul className="about-team">
          {TEAM.map((member, i) => (
            <li
              key={member.name}
              className={`about-card accent-${member.accent}`}
              style={{ '--i': i }}
              onPointerMove={trackPointer}
            >
              <span className="about-avatar" aria-hidden="true">
                <span className="about-avatar-ring" />
                {member.name.slice(0, 2).toUpperCase()}
              </span>
              <h3>{member.name}</h3>
              <ul className="about-roles">
                {member.roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Reveal>

      <section className="about-cta">
        <h2>Say hello</h2>
        <p>Questions, ideas, or a commission in mind? Find us on Discord.</p>
        <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="about-btn">
          Join our Discord
        </a>
      </section>
    </div>
  )
}

export default AboutPage
