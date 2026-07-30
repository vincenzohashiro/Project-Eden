import HeroPanel from '../components/HeroPanel'
import specializedLogo from '../assets/SpecializedRed.png'
import { PRODUCTS } from '../data/products'
import './ModelShopPage.css'

function ModelShopPage() {
  return (
    <div className="shop-page">
      <header className="hero">
        <HeroPanel>
          <span className="eyebrow">MINECRAFT CUSTOM MODEL SHOP</span>
          <h1>
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
          </h1>
          <p className="tagline">
            Bring the exact models from Project Eden into your own world. Store
            opening soon.
          </p>
        </HeroPanel>
      </header>

      <section className="features">
        {PRODUCTS.map((product) => (
          <div className="feature-card shop-card" key={product.index}>
            <span className="feature-index">{product.index}</span>
            <h2>{product.title}</h2>
            <p>{product.body}</p>
            <span className="shop-price">Coming soon</span>
          </div>
        ))}
      </section>
    </div>
  )
}

export default ModelShopPage
