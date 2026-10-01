import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ORDER_STATUSES,
  STATUS_BY_KEY,
  fetchAllOrders,
  fetchMyOrders,
  formatDate,
  formatPrice,
  ordersEnabled,
  subscribeToOrders,
  timelineFor,
  updateOrderStatus,
} from '../lib/store'
import '../components/OrderDialog.css'
import './OrdersPage.css'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Timeline({ order }) {
  const steps = timelineFor(order)
  const events = [...(order.order_events ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const reachedAt = Object.fromEntries(events.map((e) => [e.status, e]))
  const cancelled = order.status === 'cancelled'
  const currentIndex = steps.indexOf(order.status)

  return (
    <ol className="ord-timeline">
      {steps.map((key, i) => {
        const done = !cancelled && (i < currentIndex || order.status === 'delivered')
        const current = !cancelled && i === currentIndex && order.status !== 'delivered'
        const event = reachedAt[key]
        return (
          <li key={key} className={`${done ? 'is-done' : ''}${current ? ' is-current' : ''}`}>
            <span className="ord-timeline-dot" />
            <div>
              <strong>{STATUS_BY_KEY[key].label}</strong>
              {event ? (
                <span>{formatDate(event.created_at)}</span>
              ) : (
                <span className="ord-muted">{current ? 'Now' : 'Pending'}</span>
              )}
              {current && <p>{STATUS_BY_KEY[key].hint}</p>}
              {event?.note && <p className="ord-note">{event.note}</p>}
            </div>
          </li>
        )
      })}
      {cancelled && (
        <li className="is-cancelled">
          <span className="ord-timeline-dot" />
          <div>
            <strong>Cancelled</strong>
            <span>{reachedAt.cancelled ? formatDate(reachedAt.cancelled.created_at) : ''}</span>
            {order.staff_note && <p className="ord-note">{order.staff_note}</p>}
          </div>
        </li>
      )}
    </ol>
  )
}

function AdminControls({ order, onSaved }) {
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateOrderStatus(order.id, status, note)
      setNote('')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ord-admin" onSubmit={save}>
      <span className="ord-admin-label">Staff</span>
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Order status">
        {ORDER_STATUSES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note shown to the player (optional)"
        maxLength={300}
        aria-label="Status note"
      />
      <button type="submit" disabled={saving || (status === order.status && !note.trim())}>
        {saving ? 'Saving…' : 'Update'}
      </button>
      {error && <p className="ord-admin-error">{error}</p>}
    </form>
  )
}

function OrderCard({ order, open, onToggle, isAdmin, onChanged }) {
  const total = order.price_cents == null ? 'Quoted' : formatPrice(order.price_cents * order.quantity)

  return (
    <article className={`ord-card${open ? ' is-open' : ''} kind-${order.kind}`}>
      <button type="button" className="ord-card-head" onClick={onToggle} aria-expanded={open}>
        <code>{order.code}</code>
        <span className="ord-card-item">
          {order.item_name}
          {order.quantity > 1 && <em> x{order.quantity}</em>}
        </span>
        <span className="ord-card-date">{formatDate(order.created_at)}</span>
        <span className="ord-card-total">{total}</span>
        <span className={`order-status status-${order.status}`}>{STATUS_BY_KEY[order.status]?.label}</span>
        <span className="ord-card-chevron">
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="ord-card-body">
          <Timeline order={order} />

          <dl className="ord-details">
            {order.minecraft_username && (
              <div>
                <dt>Minecraft username</dt>
                <dd>{order.minecraft_username}</dd>
              </div>
            )}
            <div>
              <dt>Type</dt>
              <dd>{order.kind === 'commission' ? 'Commission' : order.kind === 'rank' ? 'Rank' : 'Cosmetic'}</dd>
            </div>
            {order.notes && (
              <div className="ord-details-wide">
                <dt>Your notes</dt>
                <dd>{order.notes}</dd>
              </div>
            )}
            <div className="ord-details-wide">
              <dt>Need help?</dt>
              <dd>
                Open a ticket on{' '}
                <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                  Discord
                </a>{' '}
                and mention <code>{order.code}</code>.
              </dd>
            </div>
          </dl>

          {isAdmin && <AdminControls order={order} onSaved={onChanged} />}
        </div>
      )}
    </article>
  )
}

function OrdersPage() {
  const { user, profile, loading, loginWithDiscord } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [view, setView] = useState('mine')
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const rows = view === 'all' && isAdmin ? await fetchAllOrders() : await fetchMyOrders(user.id)
      setOrders(rows)
      setError('')
      setOpenId((id) => id ?? rows[0]?.id ?? null)
    } catch (err) {
      setError(err.message)
      setOrders([])
    }
  }, [user, view, isAdmin])

  useEffect(() => {
    if (!user) return undefined
    load()
    return subscribeToOrders(load)
  }, [user, load])

  let content
  if (!ordersEnabled) {
    content = (
      <div className="ord-empty">
        <p>Order tracking is unavailable right now. Open a ticket on Discord for an update on an order.</p>
      </div>
    )
  } else if (loading) {
    content = <p className="ord-muted">Checking your session…</p>
  } else if (!user) {
    content = (
      <div className="ord-empty">
        <p>Sign in with Discord to see your orders and their live status.</p>
        <button type="button" className="ord-btn" onClick={() => loginWithDiscord('/orders')}>
          Sign in with Discord
        </button>
      </div>
    )
  } else if (orders === null) {
    content = <p className="ord-muted">Loading orders…</p>
  } else if (orders.length === 0) {
    content = (
      <div className="ord-empty">
        <p>{view === 'all' ? 'No orders have been placed yet.' : 'You have no orders yet.'}</p>
        <Link to="/server#store" className="ord-btn">
          Browse the store
        </Link>
      </div>
    )
  } else {
    content = (
      <div className="ord-list">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            open={openId === order.id}
            onToggle={() => setOpenId((id) => (id === order.id ? null : order.id))}
            isAdmin={isAdmin && view === 'all'}
            onChanged={load}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="ord-page">
      <header className="ord-head">
        <div>
          <h1>{view === 'all' ? 'All orders' : 'Your orders'}</h1>
          <p>Statuses update live as we confirm payment and deliver.</p>
        </div>
        {isAdmin && (
          <div className="ord-tabs" role="tablist" aria-label="Order views">
            <button type="button" role="tab" aria-selected={view === 'mine'} className={view === 'mine' ? 'is-active' : ''} onClick={() => { setOrders(null); setOpenId(null); setView('mine') }}>
              Mine
            </button>
            <button type="button" role="tab" aria-selected={view === 'all'} className={view === 'all' ? 'is-active' : ''} onClick={() => { setOrders(null); setOpenId(null); setView('all') }}>
              All orders
            </button>
          </div>
        )}
      </header>
      {error && <p className="ord-error">{error}</p>}
      {content}
    </div>
  )
}

export default OrdersPage
