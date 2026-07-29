function HeroPanel({ children }) {
  return (
    <div className="hero-panel">
      <span className="hero-corner tl" aria-hidden="true" />
      <span className="hero-corner br" aria-hidden="true" />
      <span className="panel-glitch g1" aria-hidden="true" />
      <span className="panel-glitch g2" aria-hidden="true" />
      <div className="hero-content">{children}</div>
    </div>
  )
}

export default HeroPanel
