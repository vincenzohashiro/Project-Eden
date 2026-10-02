import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import '../components/OrderDialog.css'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
)

// Shown before sending someone to Discord for a quote: offers the FAQ first
// so they arrive with the details a ticket needs.
function QuoteGate({ onClose }) {
  const faqLink = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    faqLink.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="od-overlay accent-red"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="od-dialog" role="dialog" aria-modal="true" aria-labelledby="qg-title">
        <button type="button" className="od-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <header className="od-head">
          <span className="od-kind">Before you open a ticket</span>
          <h2 id="qg-title">Read how ordering works?</h2>
          <p>
            Our FAQ covers what to include in your ticket, starting prices, turnaround times, and
            our terms. Reading it first gets you a quote faster.
          </p>
        </header>
        <div className="od-state">
          <div className="od-actions">
            <Link to="/qa#how-to-order" className="od-btn od-btn-fill" ref={faqLink} onClick={onClose}>
              Read the FAQ
            </Link>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="od-btn od-btn-ghost"
              onClick={onClose}
            >
              Continue to Discord
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default QuoteGate
