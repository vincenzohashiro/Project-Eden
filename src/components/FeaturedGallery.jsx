import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Reveal from './Reveal'
import { fetchMedia, subscribeToMedia } from '../lib/media'
import './FeaturedGallery.css'

const AUTOPLAY_MS = 6000

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
)

const altFor = (img, i) => img.alt || `Featured model ${i + 1}`

function Lightbox({ images, index, onIndex, onClose }) {
  const img = images[index]
  const step = useCallback((d) => onIndex((index + d + images.length) % images.length), [index, images.length, onIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, step])

  return createPortal(
    <div className="fg-lightbox" role="dialog" aria-modal="true" aria-label="Featured models" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button type="button" className="fg-lightbox-close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
      {images.length > 1 && (
        <button type="button" className="fg-lightbox-nav is-prev" onClick={() => step(-1)} aria-label="Previous image">
          <Arrow dir="left" />
        </button>
      )}
      <img key={img.id} src={img.url} alt={altFor(img, index)} />
      {images.length > 1 && (
        <button type="button" className="fg-lightbox-nav is-next" onClick={() => step(1)} aria-label="Next image">
          <Arrow dir="right" />
        </button>
      )}
      <span className="fg-lightbox-count">
        {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </span>
    </div>,
    document.body,
  )
}

// Image-only showcase of finished models. Images are managed by staff in
// /admin (Images), so this shows whatever is uploaded there, in that order.
function FeaturedGallery() {
  const [images, setImages] = useState(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const thumbs = useRef(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      fetchMedia('featured')
        .then((rows) => alive && setImages(rows))
        .catch(() => alive && setImages([]))
    load()
    const unsubscribe = subscribeToMedia(load)
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const count = images?.length ?? 0
  const index = count ? Math.min(active, count - 1) : 0
  const go = useCallback((i) => count && setActive((i + count) % count), [count])

  // gentle autoplay, paused on hover/focus and while the lightbox is open
  useEffect(() => {
    if (count < 2 || paused || zoomed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [count, index, paused, zoomed, go])

  // keep the active thumbnail in view
  useEffect(() => {
    const strip = thumbs.current
    const el = strip?.children[index]
    if (el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [index])

  if (images === null) return <div className="fg-stage fg-is-loading" aria-hidden="true" />

  if (count === 0) {
    return (
      <div className="fg-stage fg-is-empty">
        <span className="fg-empty-ring" aria-hidden="true" />
        <p>New models are on the way.</p>
      </div>
    )
  }

  const img = images[index]

  return (
    <Reveal className="fg" direction="fade">
      <div
        className="fg-stage"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(index - 1)
          if (e.key === 'ArrowRight') go(index + 1)
        }}
      >
        <span className="fg-corner tl" aria-hidden="true" />
        <span className="fg-corner tr" aria-hidden="true" />
        <span className="fg-corner bl" aria-hidden="true" />
        <span className="fg-corner br" aria-hidden="true" />

        <button type="button" className="fg-view" onClick={() => setZoomed(true)} aria-label={`View ${altFor(img, index)} full size`}>
          <img key={img.id} src={img.url} alt={altFor(img, index)} className="fg-image" />
          <span className="fg-zoom" aria-hidden="true">
            <ExpandIcon />
          </span>
        </button>

        {count > 1 && (
          <>
            <button type="button" className="fg-nav is-prev" onClick={() => go(index - 1)} aria-label="Previous image">
              <Arrow dir="left" />
            </button>
            <button type="button" className="fg-nav is-next" onClick={() => go(index + 1)} aria-label="Next image">
              <Arrow dir="right" />
            </button>
            <span className="fg-count" aria-live="polite">
              {String(index + 1).padStart(2, '0')} <em>/ {String(count).padStart(2, '0')}</em>
            </span>
            {!paused && !zoomed && <span key={index} className="fg-progress" style={{ '--ms': `${AUTOPLAY_MS}ms` }} aria-hidden="true" />}
          </>
        )}
      </div>

      {count > 1 && (
        <div className="fg-thumbs" ref={thumbs} role="tablist" aria-label="Choose an image">
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={altFor(m, i)}
              className={i === index ? 'is-active' : ''}
              style={{ '--i': i }}
              onClick={() => go(i)}
            >
              <img src={m.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {zoomed && <Lightbox images={images} index={index} onIndex={setActive} onClose={() => setZoomed(false)} />}
    </Reveal>
  )
}

export default FeaturedGallery
