import shopImg from '../assets/ModelShop.png'

function ShopBackdrop() {
  return (
    <div className="term-bg shop-bg" style={{ '--shop-url': `url(${shopImg})` }} aria-hidden="true">
      <span className="site-corner tl" />
      <span className="site-corner tr" />
      <span className="site-corner bl" />
      <span className="site-corner br" />

      <div className="term-photo" />

      <svg className="term-emblem" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="200" cy="200" r="108" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M200 88 L200 312 M88 200 L312 200" stroke="currentColor" strokeWidth="1" />
        <rect
          x="182"
          y="182"
          width="36"
          height="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          transform="rotate(45 200 200)"
        />
      </svg>

      <div className="term-status">
        <span className="term-status-label">NETWORK</span>
        <span className="term-status-value">ONLINE</span>
        <span className="term-status-id">0.801.25.392.1</span>
      </div>
    </div>
  )
}

export default ShopBackdrop
