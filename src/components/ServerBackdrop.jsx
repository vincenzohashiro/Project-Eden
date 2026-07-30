function ServerBackdrop() {
  return (
    <div className="term-bg server-bg" aria-hidden="true">
      <span className="site-corner tl" />
      <span className="site-corner tr" />
      <span className="site-corner bl" />
      <span className="site-corner br" />

      <svg className="term-emblem" viewBox="0 0 400 400">
        <path
          d="M200 70 L320 140 L320 260 L200 330 L80 260 L80 140 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M80 140 L200 210 L320 140 M200 210 L200 330" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      <span className="term-blip b1" />
      <span className="term-blip b2" />
      <span className="term-blip b3" />

      <div className="term-status">
        <span className="term-status-label">SERVER STATUS</span>
        <span className="term-status-value">ONLINE</span>
        <span className="term-status-id">play.projecteden.net</span>
      </div>
    </div>
  )
}

export default ServerBackdrop
