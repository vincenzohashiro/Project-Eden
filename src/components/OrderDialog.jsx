import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatPrice, ordersEnabled, placeOrder, STATUS_BY_KEY } from '../lib/store'
import './OrderDialog.css'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Buy / request flow for one catalog item. Signed-out visitors are asked to
// sign in first and land back here with the dialog reopened (?buy=<key>).
function OrderDialog({ item, accent = 'green', onClose }) {
  const { user, loading, loginWithDiscord } = useAuth()
  const location = useLocation()
  const [quantity, setQuantity] = useState(1)
  const [mcName, setMcName] = useState('')
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const firstField = useRef(null)

  const inGame = item.kind !== 'commission'
  const isQuoted = item.price_cents == null

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    firstField.current?.focus()
  }, [user])

  const signIn = () => {
    const back = `${location.pathname}?buy=${encodeURIComponent(item.key)}`
    loginWithDiscord(back)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (inGame && !mcName.trim()) {
      setError('Enter the Minecraft username that should receive this.')
      return
    }
    if (!inGame && !notes.trim()) {
      setError('Describe what you would like built so we can quote it.')
      return
    }
    setPending(true)
    try {
      setOrder(await placeOrder({ itemKey: item.key, quantity, minecraftUsername: mcName, notes }))
    } catch (err) {
      setError(err.message || 'Could not place the order. Try again.')
    } finally {
      setPending(false)
    }
  }

  let body
  if (!ordersEnabled) {
    body = (
      <div className="od-state">
        <p>Ordering is unavailable right now. Open a ticket on Discord and we will sort it out there.</p>
        <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="od-btn od-btn-fill">
          Open Discord
        </a>
      </div>
    )
  } else if (loading) {
    body = <div className="od-state"><p>Checking your session…</p></div>
  } else if (!user) {
    body = (
      <div className="od-state">
        <p>
          You can play without an account. To buy, sign in with Discord so your order is saved and
          you can track it.
        </p>
        <button type="button" className="od-btn od-btn-fill" onClick={signIn} ref={firstField}>
          Sign in with Discord
        </button>
      </div>
    )
  } else if (order) {
    const status = STATUS_BY_KEY[order.status]
    body = (
      <div className="od-state od-success">
        <span className="od-success-icon">
          <CheckIcon />
        </span>
        <p className="od-success-title">
          Order <strong>{order.code}</strong> placed
        </p>
        <p>
          Status: <strong>{status?.label}</strong>. {status?.hint}
        </p>
        <div className="od-actions">
          <Link to="/orders" className="od-btn od-btn-fill" onClick={onClose}>
            Track this order
          </Link>
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="od-btn od-btn-ghost">
            Open a ticket
          </a>
        </div>
      </div>
    )
  } else {
    body = (
      <form className="od-form" onSubmit={submit} noValidate>
        <label className="od-field">
          <span>Minecraft username{inGame ? '' : ' (optional)'}</span>
          <input
            ref={firstField}
            type="text"
            value={mcName}
            onChange={(e) => setMcName(e.target.value)}
            maxLength={16}
            autoComplete="off"
            spellCheck="false"
            placeholder="Steve"
          />
        </label>

        {item.kind === 'cosmetic' && (
          <label className="od-field od-field-qty">
            <span>Quantity</span>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
        )}

        <label className="od-field">
          <span>{inGame ? 'Notes (optional)' : 'What should we build?'}</span>
          <textarea
            rows={inGame ? 2 : 4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
            placeholder={inGame ? 'Anything we should know' : 'Describe the model, add reference links, and any deadline'}
          />
        </label>

        <div className="od-summary">
          <span>Total</span>
          <strong>{isQuoted ? 'Quoted after review' : formatPrice(item.price_cents * quantity)}</strong>
        </div>

        {error && (
          <p className="od-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="od-btn od-btn-fill od-submit" disabled={pending}>
          {pending ? 'Placing order…' : isQuoted ? 'Request a quote' : 'Place order'}
        </button>
        <p className="od-fine">
          No payment is taken here. We confirm payment through a Discord ticket, and you can follow
          every step on your Orders page.
        </p>
      </form>
    )
  }

  return createPortal(
    <div
      className={`od-overlay accent-${accent}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="od-dialog" role="dialog" aria-modal="true" aria-labelledby="od-title">
        <button type="button" className="od-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <header className="od-head">
          <span className="od-kind">{item.kind === 'commission' ? 'Commission' : item.kind === 'rank' ? 'Rank' : 'Cosmetic'}</span>
          <h2 id="od-title">{item.name}</h2>
          <p>{item.description}</p>
          <span className="od-price">{formatPrice(item.price_cents)}</span>
        </header>
        {body}
      </div>
    </div>,
    document.body,
  )
}

export default OrderDialog
