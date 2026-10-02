import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import smasherSkin from '../assets/smasher.png'
import cityArt from '../assets/ModelShop.png'
import SkinViewer3D from '../components/SkinViewer3D'
import Reveal from '../components/Reveal'
import OrderDialog from '../components/OrderDialog'
import QuoteGate from '../components/QuoteGate'
import FeaturedGallery from '../components/FeaturedGallery'
import { FALLBACK_CATALOG, commissionKey } from '../lib/store'
import './ModelShopPage.css'

const SkinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="9" y="3" width="6" height="6" rx="1" />
    <circle cx="10.6" cy="5.6" r="0.55" fill="currentColor" stroke="none" />
    <circle cx="13.4" cy="5.6" r="0.55" fill="currentColor" stroke="none" />
    <path d="M10.8 7.4h2.4" strokeLinecap="round" />
    <rect x="8" y="10" width="8" height="7" rx="1" />
    <rect x="3" y="10" width="4" height="8" rx="1" />
    <rect x="17" y="10" width="4" height="8" rx="1" />
    <rect x="8" y="18" width="3" height="4" rx="1" />
    <rect x="13" y="18" width="3" height="4" rx="1" />
  </svg>
)

const WingedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="9" y="3" width="6" height="6" rx="1" />
    <rect x="8" y="10" width="8" height="7" rx="1" />
    <rect x="8" y="18" width="3" height="4" rx="1" />
    <rect x="13" y="18" width="3" height="4" rx="1" />
    <path d="M8 11c-2.5.5-4.5 2.5-5 5.5 1.8-.6 3.2-.6 4.4 0" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 11c2.5.5 4.5 2.5 5 5.5-1.8-.6-3.2-.6-4.4 0" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ToolsClusterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M5 21 18 8M18 8l-2.2.4L16 6.2 13.8 6l-.4 2.2L11.4 8.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 3c2 1.4 2 4.6-.4 6.2-1.6 1-3.2.7-4.2.1" strokeLinecap="round" />
  </svg>
)

const CouchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M4 19v-3.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V19" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 19h2M19 19h2M3 16v3M21 16v3" strokeLinecap="round" />
    <path d="M6.5 13.5V8a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v5.5" />
  </svg>
)

const TeddyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <circle cx="6.2" cy="6.6" r="2.1" />
    <circle cx="17.8" cy="6.6" r="2.1" />
    <circle cx="12" cy="13" r="6" />
    <circle cx="9.5" cy="11.8" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="11.8" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14.6" r="1.1" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RotateLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4.5 9.5A8 8 0 1 1 6 17.2" strokeLinecap="round" />
    <path d="M4 4.5v5h5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RotateRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M19.5 9.5A8 8 0 1 0 18 17.2" strokeLinecap="round" />
    <path d="M20 4.5v5h-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
)

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="18" cy="5" r="2.4" />
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="18" cy="19" r="2.4" />
    <path d="M8.2 10.8 15.8 6.4M8.2 13.2l7.6 4.4" strokeLinecap="round" />
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 20.5 4.5 13a4.5 4.5 0 0 1 6.5-6.2l1 1 1-1a4.5 4.5 0 0 1 6.5 6.2L12 20.5z" strokeLinejoin="round" />
  </svg>
)

const SKIN_ACCENTS = ['red', 'crimson', 'rose']

// smasher.png is the only real skin texture we have right now - every slot
// reuses it as a placeholder so the texture -> model pipeline is visible
// end to end. Swap in real per-skin textures once they exist.
const SKIN_CATALOGUE = Array.from({ length: 24 }, (_, i) => ({
  label: `Skin ${String(i + 1).padStart(2, '0')}`,
  Icon: SkinIcon,
  texture: smasherSkin,
  accent: SKIN_ACCENTS[i % SKIN_ACCENTS.length],
  description: 'Custom player skin, ready to apply in-game and preview from every angle.',
}))

const CATEGORIES = [
  {
    label: 'Minecraft Skins',
    Icon: SkinIcon,
    accent: 'red',
    description: 'Player skins tailored to your character, from simple retextures to full overhauls.',
    items: SKIN_CATALOGUE,
  },
  {
    label: 'Custom Items',
    Icon: WingedIcon,
    accent: 'crimson',
    description: 'One-off item models built to spec for quests, cosmetics, or server events.',
  },
  {
    label: 'Custom Tools',
    Icon: ToolsClusterIcon,
    accent: 'rose',
    description: 'Bespoke tool sets with matching CustomModelData, ready for survival or roleplay servers.',
  },
  {
    label: 'Furnitures',
    Icon: CouchIcon,
    accent: 'red',
    description: 'Functional furniture models to fill out builds: seating, storage, and decor.',
  },
  {
    label: 'Plushies',
    Icon: TeddyIcon,
    accent: 'crimson',
    description: 'Soft, low-poly companion models perfect for spawn rooms and player lounges.',
  },
]

// condensed from the full process on the FAQ page (/qa#how-to-order)
const ORDER_STEPS = [
  {
    title: 'Open a ticket',
    body: 'Create a ticket in #ticket-support with the item type, a style reference, and your Paper / Spigot version.',
  },
  {
    title: 'Receive your quote',
    body: 'We send an estimated price and turnaround. Work starts once you approve it.',
  },
  {
    title: 'Get your files',
    body: 'You receive the model or texture, resource pack integration, and installation instructions.',
  },
]

// pointer position in px, for cursor-following glows
const trackPointer = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

// pointer offset from centre in -0.5..0.5, for tilt / parallax
const trackOffset = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--px', ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3))
  e.currentTarget.style.setProperty('--py', ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3))
}

const resetOffset = (e) => {
  e.currentTarget.style.setProperty('--px', 0)
  e.currentTarget.style.setProperty('--py', 0)
}

// 8x8 face crop from a 64x64 skin texture
function SkinFace({ texture, className = '', style }) {
  return (
    <span
      className={`shop-face ${className}`}
      style={{ '--skin-url': `url(${texture})`, ...style }}
      aria-hidden="true"
    />
  )
}

function CategoryBento({ categories, onOpen }) {
  const [skins, ...rest] = categories

  return (
    <Reveal className="shop-bento" direction="fade">
      <button
        type="button"
        className={`shop-tile shop-tile-feature accent-${skins.accent}`}
        style={{ '--i': 0 }}
        onPointerMove={trackPointer}
        onClick={() => onOpen(skins, 0)}
      >
        <span className="shop-tile-faces" aria-hidden="true">
          {skins.items.slice(0, 18).map((skin, i) => (
            <SkinFace key={skin.label} texture={skin.texture} style={{ '--i': i }} />
          ))}
        </span>
        <span className="shop-tile-body">
          <span className="shop-tile-icon">
            <skins.Icon />
          </span>
          <span className="shop-tile-label">{skins.label}</span>
          <span className="shop-tile-desc">{skins.description}</span>
          <span className="shop-tile-go">
            Browse {skins.items.length} skins
            <ChevronRightIcon />
          </span>
        </span>
      </button>

      {rest.map((category, i) => (
        <button
          key={category.label}
          type="button"
          className={`shop-tile accent-${category.accent}`}
          style={{ '--i': i + 1 }}
          onPointerMove={trackPointer}
          onClick={() => onOpen(category, i + 1)}
        >
          <span className="shop-tile-icon">
            <category.Icon />
          </span>
          <span className="shop-tile-label">{category.label}</span>
          <span className="shop-tile-desc">{category.description}</span>
          <span className="shop-tile-go">
            View
            <ChevronRightIcon />
          </span>
        </button>
      ))}
    </Reveal>
  )
}

// Drag-to-spin: tracks horizontal pointer movement and turns it into a
// rotateY() angle, so a flat icon can be "turned" like a held object.
function useDragRotate(sensitivity = 0.6) {
  const [rotation, setRotation] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef(null)

  const onPointerDown = (e) => {
    drag.current = { startX: e.clientX, startRotation: rotation }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    setRotation(drag.current.startRotation + dx * sensitivity)
  }

  const endDrag = () => {
    drag.current = null
    setDragging(false)
  }

  return {
    rotation,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}

function ShopItemModal({ item, index, onClose, onOrder }) {
  const { rotation, dragging, handlers } = useDragRotate()

  if (!item) return null
  const { label, Icon, accent, description, texture } = item
  const tagNumber = String(index + 1).padStart(2, '0')

  return (
    <div
      className="shop-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`shop-modal accent-${accent}`}>
        <span className="shop-modal-tag tl">{tagNumber}</span>
        <span className="shop-modal-tag br">{tagNumber}</span>

        <button type="button" className="shop-modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="shop-modal-eyebrow-row">
          <span className="shop-modal-line" />
          <span className="shop-modal-eyebrow">{label}</span>
          <span className="shop-modal-line" />
        </div>

        <div className="shop-modal-body">
          <div className="shop-modal-col left">
            <h2 className="shop-modal-title">{label}</h2>
            <span className="shop-modal-underline" />
          </div>

          <div
            className={`shop-modal-center${texture ? ' is-skin' : dragging ? ' dragging' : ''}`}
            {...(texture ? {} : handlers)}
          >
            {!texture && (
              <>
                <span className="shop-modal-ring r1" />
                <span className="shop-modal-ring r2" />
                <span className="shop-modal-ring r3" />
              </>
            )}
            {texture ? (
              <SkinViewer3D texture={texture} className="shop-skin-3d" />
            ) : (
              <span
                className="shop-modal-icon"
                style={{ transform: `rotateY(${rotation}deg)` }}
              >
                <Icon />
              </span>
            )}
            <span className="shop-modal-drag-hint">Drag to rotate</span>
          </div>

          <div className="shop-modal-col right">
            <span className="shop-modal-label">Description</span>
            <span className="shop-modal-underline small" />
            <p className="shop-modal-desc">{description}</p>

            <button type="button" className="shop-btn shop-btn-fill shop-modal-order" onClick={() => onOrder(item)}>
              Order this
              <ChevronRightIcon />
            </button>

            <div className="shop-modal-actions">
              <button type="button" className="shop-modal-action" aria-label="Share">
                <ShareIcon />
              </button>
              <button type="button" className="shop-modal-action" aria-label="Favorite">
                <HeartIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShopCatalogueModal({ category, onClose, onSelectItem }) {
  const { label, accent, items } = category

  return (
    <div
      className="shop-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`shop-catalogue accent-${accent}`}>
        <button type="button" className="shop-modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="shop-modal-eyebrow-row">
          <span className="shop-modal-line" />
          <span className="shop-modal-eyebrow">{label}</span>
          <span className="shop-modal-line" />
        </div>

        <div className="shop-catalogue-grid">
          {items.map((skin, index) => (
            <button
              key={skin.label}
              type="button"
              className="shop-catalogue-item"
              onClick={() => onSelectItem(skin, index)}
            >
              {skin.texture ? (
                <span
                  className="shop-catalogue-item-face"
                  style={{ '--skin-url': `url(${skin.texture})` }}
                />
              ) : (
                <span className="shop-catalogue-item-icon">
                  <skin.Icon />
                </span>
              )}
              <span className="shop-catalogue-item-label">{skin.label}</span>
              <span className="shop-card-underline" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModelShopPage() {
  const [selected, setSelected] = useState(null)
  const [catalogue, setCatalogue] = useState(null)
  const [catalogueItem, setCatalogueItem] = useState(null)

  const anyModalOpen = Boolean(selected || catalogue || catalogueItem)

  useEffect(() => {
    if (!anyModalOpen) return undefined

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      if (catalogueItem) setCatalogueItem(null)
      else if (catalogue) setCatalogue(null)
      else setSelected(null)
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [anyModalOpen, catalogue, catalogueItem])

  const { hash } = useLocation()
  const [params, setParams] = useSearchParams()
  const [ordering, setOrdering] = useState(null)
  const [gateOpen, setGateOpen] = useState(false)
  const heroViewer = useRef(null)

  // the router resets scroll on navigation after this effect runs, so defer
  // the jump to a #section link (e.g. "How to Order" from the home page)
  useEffect(() => {
    if (!hash) return undefined
    const t = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(t)
  }, [hash])

  // every Models-page item orders as a commission; skins share one category
  const handleOrder = (item) => {
    const key = item.texture ? 'com-minecraft-skins' : commissionKey(item.label)
    const entry = FALLBACK_CATALOG.find((c) => c.key === key)
    if (!entry) return
    setSelected(null)
    setCatalogueItem(null)
    setCatalogue(null)
    setOrdering(entry)
  }

  // returning from Discord sign-in with ?buy=<key> reopens that order
  useEffect(() => {
    const key = params.get('buy')
    if (!key) return
    const entry = FALLBACK_CATALOG.find((c) => c.key === key)
    if (entry) setOrdering(entry)
    params.delete('buy')
    setParams(params, { replace: true })
  }, [params, setParams])

  const handleSelect = (item, index) => {
    if (item.items) setCatalogue({ item })
    else setSelected({ item, index })
  }

  return (
    <div className="shop-page">
      <header className="shop-hero" onPointerMove={trackOffset} onPointerLeave={resetOffset}>
        <img className="shop-hero-art" src={cityArt} alt="" />
        <div className="shop-hero-copy">
          <span className="shop-kicker">Eden Specialized</span>
          <h1>
            Specialized
            <br />
            Models
          </h1>
          <p>
            Custom item models, skins, and furniture, built to spec for your server and
            delivered as a ready-to-use resource pack.
          </p>
          <div className="shop-hero-actions">
            <button type="button" className="shop-btn shop-btn-fill" onClick={() => setGateOpen(true)}>
              Start a Project
            </button>
            <Link to="/qa#how-to-order" className="shop-btn shop-btn-ghost">
              How to Order
            </Link>
          </div>
        </div>
        <div className="shop-hero-stage">
          <span className="shop-hero-pad" aria-hidden="true" />
          <SkinViewer3D texture={smasherSkin} className="shop-hero-skin" idle apiRef={heroViewer} />

          {/* rotate affordances: click to turn, or drag the model directly */}
          <button
            type="button"
            className="shop-rotate-btn left"
            aria-label="Rotate model left"
            onClick={() => heroViewer.current?.rotate(-90)}
          >
            <RotateLeftIcon />
          </button>
          <button
            type="button"
            className="shop-rotate-btn right"
            aria-label="Rotate model right"
            onClick={() => heroViewer.current?.rotate(90)}
          >
            <RotateRightIcon />
          </button>
          <div className="shop-orbit-hint" aria-hidden="true">
            <svg viewBox="0 0 300 70" fill="none">
              <path className="shop-orbit-arc" d="M28 22 C 60 62, 240 62, 272 22" />
              <path className="shop-orbit-head" d="M20 30 L28 22 L38 26" />
              <path className="shop-orbit-head" d="M262 26 L272 22 L280 30" />
            </svg>
            <span>Drag to rotate</span>
          </div>
        </div>
      </header>

      <section className="shop-block" aria-labelledby="featured-title">
        <div className="shop-block-head">
          <h2 id="featured-title">Featured Items</h2>
          <p>Recent models from our workshop.</p>
        </div>
        <FeaturedGallery />
      </section>

      <section className="shop-block" aria-labelledby="category-title">
        <div className="shop-block-head">
          <h2 id="category-title">Browse by Category</h2>
          <p>Custom items creation, from a single skin to a full furniture set.</p>
        </div>
        <CategoryBento categories={CATEGORIES} onOpen={handleSelect} />
      </section>

      <Reveal as="section" className="shop-order" direction="fade" id="how-to-order" aria-labelledby="order-title">
        <div className="shop-order-steps">
          <h2 id="order-title">How to Order</h2>
          <ol>
            {ORDER_STEPS.map((step, index) => (
              <li key={step.title} style={{ '--i': index }}>
                <span className="shop-step-num">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/qa" className="shop-order-more">
            Pricing, turnaround, and terms in the FAQ
            <ChevronRightIcon />
          </Link>
        </div>

        <div className="shop-cta">
          <h3>
            Ready to make your <em>ideas</em> come to life?
          </h3>
          <button type="button" className="shop-btn shop-btn-fill shop-btn-lg" onClick={() => setGateOpen(true)}>
            Start a Project
            <ChevronRightIcon />
          </button>
        </div>
      </Reveal>

      {gateOpen && <QuoteGate onClose={() => setGateOpen(false)} />}

      {ordering && <OrderDialog item={ordering} accent="red" onClose={() => setOrdering(null)} />}

      {/* portaled to <body> so the overlay is fixed to the viewport and
          layered above the nav - inside .page-transition its fixed
          positioning resolves against the animated wrapper instead */}
      {anyModalOpen &&
        createPortal(
          <div className="shop-portal">
            {selected && (
              <ShopItemModal
                item={selected.item}
                index={selected.index}
                onClose={() => setSelected(null)}
              onOrder={handleOrder}
              />
            )}

            {catalogue && (
              <ShopCatalogueModal
                category={catalogue.item}
                onClose={() => setCatalogue(null)}
                onSelectItem={(item, index) => setCatalogueItem({ item, index })}
              />
            )}

            {catalogueItem && (
              <ShopItemModal
                item={catalogueItem.item}
                index={catalogueItem.index}
                onClose={() => setCatalogueItem(null)}
              onOrder={handleOrder}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  )
}

export default ModelShopPage
