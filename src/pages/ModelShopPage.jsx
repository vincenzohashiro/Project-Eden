import HeroPanel from '../components/HeroPanel'
import GlitchLogo from '../components/GlitchLogo'
import { PRODUCTS } from '../data/products'

function ModelShopPage() {
  return (
    <>
      <header className="hero">
        <HeroPanel>
          <span className="eyebrow">MINECRAFT CUSTOM MODEL SHOP</span>
          <h1>
            <GlitchLogo />
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
    </>
  )
}

export default ModelShopPage
