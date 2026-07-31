import { useEffect, useRef, useState } from 'react'
import smasherSkin from '../assets/smasher.png'
import SkinViewer3D from '../components/SkinViewer3D'
import './ModelShopPage.css'

const PickaxeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M4 6c4-3 12-3 16 0-3 1.5-5 3.6-6.4 6.4L11 10 4 6z" strokeLinejoin="round" />
    <path d="M11 10 4 20" strokeLinecap="round" />
  </svg>
)

const GliderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M3 7c3-2.4 15-2.4 18 0" strokeLinecap="round" />
    <path d="M4 7l8 12M20 7l-8 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ScytheIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M17 3c2.4 1.6 2.4 5.6-.4 7.4-2 1.3-4 .9-5.2.3" strokeLinecap="round" />
    <path d="M12.6 10.4 5 21" strokeLinecap="round" />
    <path d="M9.5 14.5h3" strokeLinecap="round" />
  </svg>
)

const HammerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="2.5" y="6" width="7" height="6" rx="1" />
    <rect x="14.5" y="6" width="7" height="6" rx="1" />
    <rect x="10" y="4" width="4" height="17" rx="1" />
  </svg>
)

const CharacterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="9" y="3" width="6" height="6" rx="1" />
    <rect x="8" y="10" width="8" height="7" rx="1" />
    <rect x="3" y="10" width="4" height="8" rx="1" />
    <rect x="17" y="10" width="4" height="8" rx="1" />
    <rect x="8" y="18" width="3" height="4" rx="1" />
    <rect x="13" y="18" width="3" height="4" rx="1" />
  </svg>
)

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

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
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

const FEATURED_ITEMS = [
  {
    label: 'Tools',
    Icon: PickaxeIcon,
    accent: 'red',
    description: 'Precision-crafted pickaxes, hoes, and shears built for utility without sacrificing style.',
  },
  {
    label: 'Gliders',
    Icon: GliderIcon,
    accent: 'crimson',
    description: 'Custom elytra reskins that turn every glide across the colony into a statement.',
  },
  {
    label: 'Weapons',
    Icon: ScytheIcon,
    accent: 'rose',
    description: 'Blades, scythes, and sidearms modeled for the server\'s combat and boss events.',
  },
  {
    label: 'Building',
    Icon: HammerIcon,
    accent: 'red',
    description: 'Custom tool and block models built to speed up large-scale construction projects.',
  },
  {
    label: 'Characters',
    Icon: CharacterIcon,
    accent: 'crimson',
    description: 'Fully rigged humanoid and mob models ready to drop into your world.',
  },
]

const SKIN_ACCENTS = ['red', 'crimson', 'rose']

// smasher.png is the only real skin texture we have right now — every slot
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
    description: 'Functional furniture models to fill out builds — seating, storage, and decor.',
  },
  {
    label: 'Plushies',
    Icon: TeddyIcon,
    accent: 'crimson',
    description: 'Soft, low-poly companion models perfect for spawn rooms and player lounges.',
  },
]

function ShopCard({ item, index, onSelect }) {
  const { label, Icon, accent } = item
  return (
    <button
      type="button"
      className={`shop-card accent-${accent}`}
      onClick={() => onSelect(item, index)}
    >
      <span className="shop-card-icon">
        <Icon />
      </span>
      <span className="shop-card-label">{label}</span>
      <span className="shop-card-underline" />
    </button>
  )
}

function ShopRow({ items, onSelect }) {
  const trackRef = useRef(null)

  const scrollByAmount = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  return (
    <div className="shop-carousel">
      <button
        type="button"
        className="shop-arrow left"
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll left"
      >
        <ChevronLeftIcon />
      </button>

      <div className="shop-card-row" ref={trackRef}>
        {items.map((item, index) => (
          <ShopCard key={item.label} item={item} index={index} onSelect={onSelect} />
        ))}
      </div>

      <button
        type="button"
        className="shop-arrow right"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll right"
      >
        <ChevronRightIcon />
      </button>
    </div>
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

function ShopItemModal({ item, index, onClose }) {
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

  const handleSelect = (item, index) => {
    if (item.items) setCatalogue({ item })
    else setSelected({ item, index })
  }

  return (
    <div className="shop-page">
      <div className="shop-frame">
        <span className="shop-frame-tag">01</span>

        <section className="shop-section">
          <span className="shop-eyebrow">Specialized Models</span>
          <div className="shop-heading">
            <span className="shop-heading-line" />
            <span className="shop-heading-dot" />
            <h2>
              FEATURED <em>ITEMS</em>
            </h2>
            <span className="shop-heading-dot" />
            <span className="shop-heading-line" />
          </div>

          <ShopRow items={FEATURED_ITEMS} onSelect={handleSelect} />
        </section>

        <div className="shop-divider">
          <span className="shop-heading-line wide" />
          <span className="shop-heading-dot" />
          <div className="shop-divider-copy">
            <h2>BROWSE BY CATEGORY</h2>
            <span>Custom Items Creation</span>
          </div>
          <span className="shop-heading-dot" />
          <span className="shop-heading-line wide" />
        </div>

        <section className="shop-section">
          <ShopRow items={CATEGORIES} onSelect={handleSelect} />
        </section>

        <div className="shop-cta">
          <div className="shop-cta-copy">
            <h3>
              Ready to make
              <br />
              your <em>ideas</em>
              <br />
              come to life?
            </h3>
          </div>
          <a href="#discord" className="shop-cta-btn">
            <span>Start a Project</span>
            <em>&#8656; Now! &#8658;</em>
          </a>
        </div>
      </div>

      {selected && (
        <ShopItemModal
          item={selected.item}
          index={selected.index}
          onClose={() => setSelected(null)}
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
        />
      )}
    </div>
  )
}

export default ModelShopPage
