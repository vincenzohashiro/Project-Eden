import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ORDER_STATUSES,
  STATUS_BY_KEY,
  fetchAdminOrders,
  formatDate,
  formatPrice,
  orderTotal,
  ordersEnabled,
  subscribeToOrders,
  updateOrder,
} from '../lib/store'
import { makeDemoOrders } from '../lib/demoOrders'
import MediaManager from '../components/MediaManager'
import '../components/OrderDialog.css'
import './AdminPage.css'

// local dev without Supabase: preview the panel with sample orders
const DEMO = !ordersEnabled && import.meta.env.DEV

const DAY = 86400000

const RANGES = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
]

// statuses grouped into the stages the panel reports on
const GROUPS = [
  { key: 'pending', label: 'Pending', statuses: ['awaiting_quote', 'awaiting_payment'] },
  { key: 'active', label: 'In progress', statuses: ['paid', 'in_progress'] },
  { key: 'completed', label: 'Completed', statuses: ['delivered'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
]
const GROUP_OF = Object.fromEntries(GROUPS.flatMap((g) => g.statuses.map((s) => [s, g.key])))
const PAID = new Set(['paid', 'in_progress', 'delivered'])

const SORTS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'updated', label: 'Recently updated' },
  { key: 'amount', label: 'Highest amount' },
]

const KIND_LABEL = { rank: 'Rank', cosmetic: 'Cosmetic', commission: 'Commission' }

// orders sitting in an open stage longer than this get flagged
const STALE_DAYS = 3

const sum = (orders) => orders.reduce((n, o) => n + (orderTotal(o) ?? 0), 0)
const eventAt = (order, status) => order.order_events?.find((e) => e.status === status)?.created_at
const lastEventAt = (order) =>
  order.order_events?.reduce((max, e) => (e.created_at > max ? e.created_at : max), order.created_at) ?? order.created_at
const buyerName = (order) => order.profile?.discord_username || order.profile?.username || 'Unknown'

function ago(iso, now) {
  const mins = Math.max(0, Math.round((now - new Date(iso)) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function duration(ms) {
  const hours = ms / 3600000
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`
  if (hours < 48) return `${Math.round(hours)}h`
  return `${Math.round(hours / 24)}d`
}

// day buckets for short ranges, week buckets for long ones
function buckets(range, orders, now) {
  const days =
    range.days ??
    Math.max(14, Math.ceil((now - Math.min(...orders.map((o) => +new Date(o.created_at)), now)) / DAY) + 1)
  const size = days > 45 ? 7 : 1
  const count = Math.ceil(days / size)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return Array.from({ length: count }, (_, i) => {
    const to = +end - (count - 1 - i) * size * DAY
    return { from: to - size * DAY, to, size }
  })
}

function exportCsv(orders) {
  const cols = ['Code', 'Placed', 'Updated', 'Status', 'Type', 'Item', 'Qty', 'Unit (USD)', 'Total (USD)', 'Buyer', 'Minecraft', 'Notes']
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = orders.map((o) =>
    [
      o.code,
      o.created_at,
      lastEventAt(o),
      STATUS_BY_KEY[o.status]?.label,
      KIND_LABEL[o.kind],
      o.item_name,
      o.quantity,
      o.price_cents == null ? '' : (o.price_cents / 100).toFixed(2),
      orderTotal(o) == null ? '' : (orderTotal(o) / 100).toFixed(2),
      buyerName(o),
      o.minecraft_username,
      o.notes,
    ]
      .map(cell)
      .join(','),
  )
  const blob = new Blob([[cols.map(cell).join(','), ...rows].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `eden-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ---------- icons ---------- */

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)
const ICONS = {
  in: 'M12 4v12m0 0-5-5m5 5 5-5M5 20h14',
  revenue: 'M4 17l5-5 4 4 7-8M15 8h5v5',
  pending: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  active: 'M4 12h4l2-6 4 12 2-6h4',
  done: 'M5 12.5 10 17 19 7',
  cancel: 'M6 6l12 12M18 6 6 18',
  chevron: 'M6 9l6 6 6-6',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 20h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4.3-4.3',
}

/* ---------- overview ---------- */

function StatCard({ icon, tone, label, value, sub, onClick, active }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`adm-stat tone-${tone}${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
    >
      <span className="adm-stat-icon">
        <Icon d={ICONS[icon]} />
      </span>
      <span className="adm-stat-label">{label}</span>
      <strong className="adm-stat-value">{value}</strong>
      <span className="adm-stat-sub">{sub}</span>
    </Tag>
  )
}

function Pipeline({ orders }) {
  const total = orders.length || 1
  const counts = ORDER_STATUSES.map((s) => ({ ...s, n: orders.filter((o) => o.status === s.key).length }))
  return (
    <section className="adm-card adm-pipeline" aria-labelledby="adm-pipeline-title">
      <header className="adm-card-head">
        <h2 id="adm-pipeline-title">Pipeline</h2>
        <span>{orders.length} orders in range</span>
      </header>
      <div className="adm-pipeline-bar" role="img" aria-label="Orders by status">
        {counts
          .filter((s) => s.n)
          .map((s) => (
            <span key={s.key} className={`seg-${s.key}`} style={{ flexGrow: s.n }} title={`${s.label}: ${s.n}`} />
          ))}
      </div>
      <ul className="adm-pipeline-legend">
        {counts.map((s) => (
          <li key={s.key} className={`seg-${s.key}`}>
            <span className="adm-dot" />
            <span>{s.label}</span>
            <strong>{s.n}</strong>
            <em>{Math.round((s.n / total) * 100)}%</em>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FlowChart({ range, orders, allOrders, now }) {
  const data = useMemo(() => {
    const bins = buckets(range, allOrders, now)
    return bins.map((b) => {
      const inBin = (iso) => iso && +new Date(iso) > b.from && +new Date(iso) <= b.to
      const placed = orders.filter((o) => inBin(o.created_at))
      return {
        ...b,
        incoming: placed.length,
        completed: allOrders.filter((o) => inBin(eventAt(o, 'delivered'))).length,
        revenue: allOrders.filter((o) => inBin(eventAt(o, 'paid'))).reduce((n, o) => n + (orderTotal(o) ?? 0), 0),
      }
    })
  }, [range, orders, allOrders, now])

  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...data.map((d) => Math.max(d.incoming, d.completed)))
  const W = 100 / data.length
  const label = (d) =>
    d.size === 1
      ? new Date(d.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Week of ${new Date(d.from + DAY).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  const shown = hover == null ? null : data[hover]

  return (
    <section className="adm-card adm-flow" aria-labelledby="adm-flow-title">
      <header className="adm-card-head">
        <h2 id="adm-flow-title">Order flow</h2>
        <ul className="adm-flow-key">
          <li className="key-in">Incoming</li>
          <li className="key-done">Completed</li>
        </ul>
      </header>
      <div className="adm-flow-plot" onPointerLeave={() => setHover(null)}>
        <div className="adm-flow-grid" aria-hidden="true">
          <span>{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Incoming and completed orders over time">
          {data.map((d, i) => (
            <g key={d.to} className={hover === i ? 'is-hover' : ''} onPointerEnter={() => setHover(i)}>
              <rect className="adm-flow-hit" x={i * W} y="0" width={W} height="100" />
              <rect className="adm-flow-in" x={i * W + W * 0.14} y={100 - (d.incoming / max) * 100} width={W * 0.34} height={(d.incoming / max) * 100} />
              <rect className="adm-flow-done" x={i * W + W * 0.52} y={100 - (d.completed / max) * 100} width={W * 0.34} height={(d.completed / max) * 100} />
            </g>
          ))}
        </svg>
        {shown && (
          <div className="adm-flow-tip" style={{ left: `calc(30px + (100% - 30px) * ${(hover + 0.5) / data.length})` }}>
            <strong>{label(shown)}</strong>
            <span className="key-in">{shown.incoming} incoming</span>
            <span className="key-done">{shown.completed} completed</span>
            <span>{formatPrice(shown.revenue)} paid</span>
          </div>
        )}
      </div>
      <div className="adm-flow-axis" aria-hidden="true">
        <span>{label(data[0])}</span>
        <span>{data[0].size === 1 ? 'Today' : 'This week'}</span>
      </div>
    </section>
  )
}

function ActivityFeed({ orders, now, onOpen }) {
  const events = useMemo(
    () =>
      orders
        .flatMap((o) => {
          const first = (o.order_events ?? []).reduce((min, e) => (!min || e.created_at < min.created_at ? e : min), null)
          return (o.order_events ?? []).map((e) => ({ ...e, order: o, isNew: e === first }))
        })
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 14),
    [orders],
  )
  return (
    <section className="adm-card adm-feed" aria-labelledby="adm-feed-title">
      <header className="adm-card-head">
        <h2 id="adm-feed-title">Recent activity</h2>
        <span className="adm-live">
          <span className="adm-dot" /> Live
        </span>
      </header>
      {events.length === 0 ? (
        <p className="adm-muted">No activity yet.</p>
      ) : (
        <ol>
          {events.map((e) => (
            <li key={e.id} className={`seg-${e.isNew ? 'new' : e.status}`}>
              <span className="adm-dot" />
              <button type="button" onClick={() => onOpen(e.order.id)}>
                <code>{e.order.code}</code>
                <span>{e.isNew ? `New order: ${e.order.item_name}` : `Moved to ${STATUS_BY_KEY[e.status]?.label}`}</span>
              </button>
              <time dateTime={e.created_at} title={formatDate(e.created_at)}>
                {ago(e.created_at, now)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/* ---------- orders table ---------- */

function OrderEditor({ order, onSave }) {
  const [status, setStatus] = useState(order.status)
  const [price, setPrice] = useState(order.price_cents == null ? '' : (order.price_cents / 100).toFixed(2))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const priceCents = price.trim() === '' ? null : Math.round(Number(price) * 100)
  const priceValid = priceCents === null || (Number.isFinite(priceCents) && priceCents >= 0)
  const changed = status !== order.status || priceCents !== order.price_cents || note.trim()

  const save = async (e) => {
    e.preventDefault()
    if (!priceValid) return setError('Enter a valid amount.')
    if (PAID.has(status) && priceCents == null) return setError('Set a price before marking this order paid.')
    setSaving(true)
    setError('')
    try {
      await onSave(order, { status, priceCents: priceCents === order.price_cents ? undefined : priceCents, staffNote: note })
      setNote('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="adm-editor" onSubmit={save}>
      <label>
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Unit price (USD)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={order.kind === 'commission' ? 'Quote amount' : '0.00'}
        />
      </label>
      <label className="adm-editor-note">
        <span>Note to buyer</span>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Optional, shown on their tracking page" />
      </label>
      <button type="submit" disabled={saving || !changed}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {error && <p className="adm-editor-error">{error}</p>}
    </form>
  )
}

function OrderRow({ order, open, onToggle, onSave, now }) {
  const total = orderTotal(order)
  const last = lastEventAt(order)
  const group = GROUP_OF[order.status]
  const waiting = (group === 'pending' || group === 'active') && now - new Date(last) > STALE_DAYS * DAY
  const events = [...(order.order_events ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const finished = eventAt(order, 'delivered')

  return (
    <>
      <tr className={`adm-row kind-${order.kind}${open ? ' is-open' : ''}`} onClick={onToggle}>
        <td>
          <button type="button" className="adm-row-toggle" aria-expanded={open} aria-label={`Details for ${order.code}`} onClick={(e) => { e.stopPropagation(); onToggle() }}>
            <Icon d={ICONS.chevron} />
          </button>
          <code>{order.code}</code>
        </td>
        <td className="adm-cell-item">
          <strong>{order.item_name}</strong>
          <span>
            {KIND_LABEL[order.kind]}
            {order.quantity > 1 && ` · x${order.quantity}`}
          </span>
        </td>
        <td className="adm-cell-buyer">
          <strong>{buyerName(order)}</strong>
          {order.minecraft_username && <span>{order.minecraft_username}</span>}
        </td>
        <td className="adm-cell-num">{total == null ? <span className="adm-quote">Needs quote</span> : formatPrice(total)}</td>
        <td>
          <span className={`order-status status-${order.status}`}>{STATUS_BY_KEY[order.status]?.label}</span>
          {waiting && <span className="adm-stale">Idle {duration(now - new Date(last))}</span>}
        </td>
        <td className="adm-cell-time">
          <span>{formatDate(order.created_at)}</span>
          <em>{ago(order.created_at, now)}</em>
        </td>
        <td className="adm-cell-time">
          <span>{formatDate(last)}</span>
          <em>{ago(last, now)}</em>
        </td>
      </tr>
      {open && (
        <tr className="adm-detail">
          <td colSpan={7}>
            <div className="adm-detail-grid">
              <div>
                <h3>Timeline</h3>
                <ol className="adm-events">
                  {events.map((e, i) => (
                    <li key={e.id} className={`seg-${e.status}`}>
                      <span className="adm-dot" />
                      <strong>{STATUS_BY_KEY[e.status]?.label}</strong>
                      <time dateTime={e.created_at}>{formatDate(e.created_at)}</time>
                      {i > 0 && <em>+{duration(new Date(e.created_at) - new Date(events[i - 1].created_at))}</em>}
                      {e.note && <p>{e.note}</p>}
                    </li>
                  ))}
                </ol>
                {finished && <p className="adm-muted">Completed in {duration(new Date(finished) - new Date(order.created_at))}.</p>}
              </div>
              <div>
                <h3>Details</h3>
                <dl className="adm-facts">
                  <div><dt>Buyer</dt><dd>{buyerName(order)}</dd></div>
                  <div><dt>Minecraft</dt><dd>{order.minecraft_username || '–'}</dd></div>
                  <div><dt>Unit price</dt><dd>{order.price_cents == null ? 'Not quoted' : formatPrice(order.price_cents)}</dd></div>
                  <div><dt>Quantity</dt><dd>{order.quantity}</dd></div>
                  <div><dt>Total</dt><dd>{total == null ? 'Not quoted' : formatPrice(total)}</dd></div>
                  <div><dt>Placed</dt><dd>{new Date(order.created_at).toLocaleString('en-US')}</dd></div>
                  {order.notes && <div className="adm-facts-wide"><dt>Buyer notes</dt><dd>{order.notes}</dd></div>}
                </dl>
              </div>
              <div className="adm-detail-edit">
                <h3>Update order</h3>
                <OrderEditor key={`${order.status}-${order.price_cents}`} order={order} onSave={onSave} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ---------- page ---------- */

function AdminPage() {
  const { user, profile, loading, loginWithDiscord } = useAuth()
  const isAdmin = DEMO || profile?.role === 'admin'

  const [orders, setOrders] = useState(() => (DEMO ? makeDemoOrders() : null))
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [tab, setTab] = useState('orders')
  const [rangeKey, setRangeKey] = useState('30d')
  const [group, setGroup] = useState('all')
  const [kind, setKind] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    if (DEMO) return
    try {
      setOrders(await fetchAdminOrders())
      setError('')
    } catch (err) {
      setError(err.message)
      setOrders([])
    }
    setNow(Date.now())
  }, [])

  useEffect(() => {
    if (DEMO || !isAdmin) return undefined
    load()
    return subscribeToOrders(load)
  }, [isAdmin, load])

  // keep "5m ago" labels fresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])

  const save = async (order, changes) => {
    if (DEMO) {
      const at = new Date().toISOString()
      setOrders((list) =>
        list.map((o) => {
          if (o.id !== order.id) return o
          const next = { ...o, status: changes.status, staff_note: changes.staffNote?.trim() || null, updated_at: at }
          if (changes.priceCents !== undefined) next.price_cents = changes.priceCents
          if (changes.status !== o.status)
            next.order_events = [...o.order_events, { id: `${o.id}-${at}`, status: changes.status, note: next.staff_note, created_at: at }]
          return next
        }),
      )
      setNow(Date.now())
      return
    }
    await updateOrder(order.id, changes)
    await load()
  }

  const range = RANGES.find((r) => r.key === rangeKey)
  const inRange = useMemo(
    () => (orders ?? []).filter((o) => range.days == null || now - new Date(o.created_at) <= range.days * DAY),
    [orders, range, now],
  )

  const stats = useMemo(() => {
    const by = (key) => inRange.filter((o) => GROUP_OF[o.status] === key)
    const pending = by('pending')
    const paid = inRange.filter((o) => PAID.has(o.status))
    const completed = by('completed')
    const turnaround = completed
      .map((o) => new Date(eventAt(o, 'delivered')) - new Date(o.created_at))
      .filter((n) => n > 0)
    return {
      incoming: inRange.length,
      incomingValue: sum(inRange.filter((o) => o.status !== 'cancelled')),
      revenue: sum(paid),
      avgOrder: paid.length ? sum(paid) / paid.length : null,
      pending: pending.length,
      awaitingQuote: pending.filter((o) => o.status === 'awaiting_quote').length,
      outstanding: sum(pending),
      active: by('active').length,
      activeValue: sum(by('active')),
      completed: completed.length,
      completedValue: sum(completed),
      avgTurnaround: turnaround.length ? turnaround.reduce((a, b) => a + b, 0) / turnaround.length : null,
      cancelled: by('cancelled').length,
      cancelledValue: sum(by('cancelled')),
    }
  }, [inRange])

  const counts = useMemo(
    () => Object.fromEntries(GROUPS.map((g) => [g.key, inRange.filter((o) => GROUP_OF[o.status] === g.key).length])),
    [inRange],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = inRange.filter(
      (o) =>
        (group === 'all' || GROUP_OF[o.status] === group) &&
        (kind === 'all' || o.kind === kind) &&
        (!q || [o.code, o.item_name, buyerName(o), o.minecraft_username].some((v) => v?.toLowerCase().includes(q))),
    )
    const cmp = {
      newest: (a, b) => b.created_at.localeCompare(a.created_at),
      oldest: (a, b) => a.created_at.localeCompare(b.created_at),
      updated: (a, b) => lastEventAt(b).localeCompare(lastEventAt(a)),
      amount: (a, b) => (orderTotal(b) ?? -1) - (orderTotal(a) ?? -1),
    }[sort]
    return [...list].sort(cmp)
  }, [inRange, group, kind, query, sort])

  const pickGroup = (key) => setGroup((g) => (g === key ? 'all' : key))
  const openOrder = (id) => {
    setGroup('all')
    setKind('all')
    setQuery('')
    setOpenId(id)
    requestAnimationFrame(() => document.getElementById(`adm-orders`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  let body
  if (!ordersEnabled && !DEMO) {
    body = <p className="adm-notice">Order tracking is not configured for this deployment.</p>
  } else if (!DEMO && loading) {
    body = <p className="adm-muted">Checking your session…</p>
  } else if (!DEMO && !user) {
    body = (
      <div className="adm-notice">
        <p>Sign in with a staff Discord account to open the panel.</p>
        <button type="button" className="adm-btn" onClick={() => loginWithDiscord('/admin')}>
          Sign in with Discord
        </button>
      </div>
    )
  } else if (!isAdmin) {
    body = <p className="adm-notice">This panel is for Project Eden staff only.</p>
  } else if (tab === 'images') {
    body = <MediaManager demo={DEMO} />
  } else if (orders === null) {
    body = <p className="adm-muted">Loading orders…</p>
  } else {
    const money = formatPrice
    body = (
      <>
        <div className="adm-stats">
          <StatCard icon="in" tone="cyan" label="Incoming" value={stats.incoming} sub={`${money(stats.incomingValue)} ordered`} />
          <StatCard
            icon="revenue"
            tone="green"
            label="Revenue"
            value={money(stats.revenue)}
            sub={stats.avgOrder == null ? 'No paid orders yet' : `${money(stats.avgOrder)} avg order`}
          />
          <StatCard
            icon="pending"
            tone="amber"
            label="Pending"
            value={stats.pending}
            sub={`${money(stats.outstanding)} unpaid · ${stats.awaitingQuote} to quote`}
            onClick={() => pickGroup('pending')}
            active={group === 'pending'}
          />
          <StatCard
            icon="active"
            tone="cyan"
            label="In progress"
            value={stats.active}
            sub={`${money(stats.activeValue)} paid, not delivered`}
            onClick={() => pickGroup('active')}
            active={group === 'active'}
          />
          <StatCard
            icon="done"
            tone="green"
            label="Completed"
            value={stats.completed}
            sub={stats.avgTurnaround == null ? money(stats.completedValue) : `${money(stats.completedValue)} · ${duration(stats.avgTurnaround)} avg`}
            onClick={() => pickGroup('completed')}
            active={group === 'completed'}
          />
          <StatCard
            icon="cancel"
            tone="red"
            label="Cancelled"
            value={stats.cancelled}
            sub={`${money(stats.cancelledValue)} lost`}
            onClick={() => pickGroup('cancelled')}
            active={group === 'cancelled'}
          />
        </div>

        <div className="adm-overview">
          <FlowChart range={range} orders={inRange} allOrders={orders} now={now} />
          <ActivityFeed orders={orders} now={now} onOpen={openOrder} />
          <Pipeline orders={inRange} />
        </div>

        <section className="adm-card adm-orders" id="adm-orders" aria-labelledby="adm-orders-title">
          <header className="adm-card-head adm-orders-head">
            <h2 id="adm-orders-title">Orders</h2>
            <div className="adm-filters">
              <div className="adm-chips" role="group" aria-label="Filter by stage">
                <button type="button" className={group === 'all' ? 'is-active' : ''} onClick={() => setGroup('all')}>
                  All <em>{inRange.length}</em>
                </button>
                {GROUPS.map((g) => (
                  <button key={g.key} type="button" className={`chip-${g.key}${group === g.key ? ' is-active' : ''}`} onClick={() => setGroup(g.key)}>
                    {g.label} <em>{counts[g.key]}</em>
                  </button>
                ))}
              </div>
              <div className="adm-tools">
                <label className="adm-search">
                  <Icon d={ICONS.search} />
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Code, item, buyer" aria-label="Search orders" />
                </label>
                <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by type">
                  <option value="all">All types</option>
                  <option value="commission">Commissions</option>
                  <option value="rank">Ranks</option>
                  <option value="cosmetic">Cosmetics</option>
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort orders">
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button type="button" className="adm-export" onClick={() => exportCsv(rows)} disabled={!rows.length}>
                  <Icon d={ICONS.download} /> CSV
                </button>
              </div>
            </div>
          </header>

          {rows.length === 0 ? (
            <p className="adm-muted adm-empty">No orders match these filters.</p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Item</th>
                    <th>Buyer</th>
                    <th className="adm-cell-num">Amount</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th>Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <OrderRow key={o.id} order={o} open={openId === o.id} onToggle={() => setOpenId((id) => (id === o.id ? null : o.id))} onSave={save} now={now} />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>
                      {rows.length} {rows.length === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="adm-cell-num">{formatPrice(sum(rows.filter((o) => o.status !== 'cancelled')))}</td>
                    <td colSpan={3}>{rows.some((o) => orderTotal(o) == null) && 'Unquoted orders not included'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <span className="adm-kicker">Staff panel</span>
          <h1>{tab === 'images' ? 'Site images' : 'Orders dashboard'}</h1>
          <p>
            {tab === 'images'
              ? 'Upload, arrange and remove the images shown on the website.'
              : 'Every order coming in, in progress, and completed. Updates live.'}
          </p>
        </div>
        {isAdmin && (
          <div className="adm-head-tools">
            <div className="adm-tabs" role="tablist" aria-label="Panel sections">
              {[
                ['orders', 'Orders'],
                ['images', 'Images'],
              ].map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
                  {label}
                </button>
              ))}
            </div>
            {tab === 'orders' && orders && (
              <div className="adm-range" role="group" aria-label="Date range">
                {RANGES.map((r) => (
                  <button key={r.key} type="button" className={rangeKey === r.key ? 'is-active' : ''} onClick={() => setRangeKey(r.key)}>
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
      {DEMO && tab === 'orders' && (
        <p className="adm-demo">Preview data: Supabase isn&apos;t configured locally, so these are sample orders. Changes aren&apos;t saved.</p>
      )}
      {error && <p className="adm-error">{error}</p>}
      {body}
    </div>
  )
}

export default AdminPage
