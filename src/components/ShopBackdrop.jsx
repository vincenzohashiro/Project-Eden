function ShopBackdrop() {
  return (
    <div className="term-bg shop-bg" aria-hidden="true">
      <span className="site-corner tl" />
      <span className="site-corner tr" />
      <span className="site-corner bl" />
      <span className="site-corner br" />

      <svg className="term-emblem" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="200" cy="200" r="108" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="176" r="46" fill="currentColor" />
        <circle cx="164" cy="214" r="46" fill="currentColor" />
        <circle cx="236" cy="214" r="46" fill="currentColor" />
        <path d="M200 214 L200 300" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      </svg>

      <span className="term-blip b1" />
      <span className="term-blip b2" />
      <span className="term-blip b3" />

      <div className="term-status">
        <span className="term-status-label">NETWORK</span>
        <span className="term-status-value">ONLINE</span>
        <span className="term-status-id">0.801.25.392.1</span>
      </div>
    </div>
  )
}

export default ShopBackdrop
