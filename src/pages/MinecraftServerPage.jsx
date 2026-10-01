import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OrderDialog from '../components/OrderDialog'
import Reveal from '../components/Reveal'
import { SERVER_ADDRESS, SERVER_LOADER, SERVER_VERSION, fetchServerStatus } from '../lib/serverStatus'
import {
  ORDER_STATUSES,
  STATUS_BY_KEY,
  fetchCatalog,
  fetchMyOrders,
  formatDate,
  formatPrice,
  ordersEnabled,
  subscribeToOrders,
} from '../lib/store'
import './MinecraftServerPage.css'

const DISCORD_INVITE_URL = 'https://discord.gg/mEhgkyUxTF'

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
    <path d="M15.5 8.5V5.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" strokeLinecap="round" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const FEATURE_ICONS = {
  economy: (
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" stroke="none" />
  ),
  quests: (
    <>
      <path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      <path d="M14 2.5V7h4M8 12h8M8 16h8" strokeLinecap="round" />
    </>
  ),
  items: (
    <>
      <path d="M3.5 7 12 3l8.5 4-8.5 4-8.5-4z" strokeLinejoin="round" />
      <path d="M3.5 7v10L12 21l8.5-4V7M12 11v10" strokeLinejoin="round" />
    </>
  ),
  bosses: (
    <path d="M20 3 8.5 14.5M20 3l-3.2.4L16 6.6 13.4 6l-.4 3.2L11.5 9.9M3 21l4.2-1.1L8.5 14.5M3 21l1.1-4.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  shops: (
    <>
      <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.4L7.6 14.6h10.2L20.5 6H5.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  community: (
    <>
      <path d="M4 18v-1.6c0-2 3-3.4 6-3.4s6 1.4 6 3.4V18" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="7.5" r="3" />
      <path d="M16 8.2c1.8.3 3.5 1.4 3.5 3v1.2" strokeLinecap="round" />
      <circle cx="16.5" cy="5.8" r="2.2" />
    </>
  ),
}

const FEATURES = [
  ['economy', 'Economy', 'Earn, trade, and spend across a player-driven market.'],
  ['quests', 'Quests', 'Story and daily quests with rewards worth chasing.'],
  ['items', 'Custom Items', 'Gear and decor built by Eden Specialized, live in-game.'],
  ['bosses', 'Custom Bosses', 'Scheduled boss fights that need a team to take down.'],
  ['shops', 'Player Shops', 'Set up a storefront and sell to the whole server.'],
  ['community', 'Active Community', 'Events, builds, and a Discord that is always awake.'],
]

const JOIN_STEPS = [
  ['Launch Minecraft', `Open Minecraft: Java Edition on version ${SERVER_VERSION}.`],
  ['Add the server', 'Go to Multiplayer, choose Add Server, and paste the address.'],
  ['Join and play', 'Accept the resource pack when asked so custom items show up.'],
]

const STORE_TABS = [
  { key: 'rank', label: 'Ranks' },
  { key: 'cosmetic', label: 'Cosmetics' },
  { key: 'commission', label: 'Specialized' },
]

function AddressBar() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`srv-address${copied ? ' is-copied' : ''}`}>
      <span className="srv-address-label">Server address</span>
      <code>{SERVER_ADDRESS}</code>
      <button type="button" onClick={copy} aria-label={`Copy server address ${SERVER_ADDRESS}`}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

function StatusConsole({ status }) {
  const known = status !== undefined && status !== null
  const online = known && status.online
  const pct = online && status.maxPlayers ? Math.min(status.players / status.maxPlayers, 1) * 100 : 0

  let state = 'Checking…'
  if (status === null) state = 'Status unavailable'
  else if (known) state = online ? 'Online' : 'Offline'

  return (
    <div className={`srv-console${online ? ' is-online' : ''}`} aria-live="polite">
      <div className="srv-console-head">
        <span className="srv-console-dot" />
        <span>{state}</span>
      </div>

      <dl className="srv-console-rows">
        <div>
          <dt>Players</dt>
          <dd>{online && status.players != null ? `${status.players} / ${status.maxPlayers}` : '-'}</dd>
        </div>
        <div className="srv-console-meter" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div>
          <dt>Version</dt>
          <dd>Java {SERVER_VERSION}</dd>
        </div>
        <div>
          <dt>Loader</dt>
          <dd>{SERVER_LOADER}</dd>
        </div>
        <div>
          <dt>Account</dt>
          <dd>Not required to play</dd>
        </div>
      </dl>

      {online && status.motd && <p className="srv-console-motd">{status.motd}</p>}
    </div>
  )
}

function StoreCard({ item, onBuy }) {
  const isRank = item.kind === 'rank'
  return (
    <article className={`srv-item kind-${item.kind}`}>
      <div className="srv-item-top">
        <h3>{item.name}</h3>
        <span className="srv-item-price">{formatPrice(item.price_cents)}</span>
      </div>
      <p>{item.description}</p>
      {isRank && item.perks?.length > 0 && (
        <ul className="srv-item-perks">
          {item.perks.map((perk) => (
            <li key={perk}>
              <CheckIcon />
              {perk}
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="srv-btn srv-btn-ghost srv-item-buy" onClick={() => onBuy(item)}>
        {item.price_cents == null ? 'Request a quote' : isRank ? 'Get this rank' : 'Buy'}
        <ArrowIcon />
      </button>
    </article>
  )
}

function OrdersPreview({ user, onSignIn }) {
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    if (!user) return undefined
    let active = true
    const load = () =>
      fetchMyOrders(user.id)
        .then((rows) => active && setOrders(rows))
        .catch(() => active && setOrders([]))
    load()
    const unsubscribe = subscribeToOrders(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [user])

  if (!user) {
    return (
      <div className="srv-track-empty">
        <ol className="srv-pipeline" aria-label="How an order moves">
          {ORDER_STATUSES.filter((s) => s.key !== 'cancelled' && s.key !== 'awaiting_quote').map((s) => (
            <li key={s.key}>
              <span className="srv-pipeline-dot" />
              {s.label}
            </li>
          ))}
        </ol>
        <p>
          Sign in with Discord to buy and to follow each order from payment to delivery. Playing on
          the server never needs an account.
        </p>
        <button type="button" className="srv-btn srv-btn-fill" onClick={onSignIn} disabled={!ordersEnabled}>
          Sign in with Discord
        </button>
      </div>
    )
  }

  if (orders === null) return <p className="srv-track-note">Loading your orders…</p>

  if (orders.length === 0) {
    return (
      <div className="srv-track-empty">
        <p>No orders yet. Anything you buy from the store above shows up here with its status.</p>
      </div>
    )
  }

  return (
    <div className="srv-track-list">
      {orders.slice(0, 3).map((order) => (
        <Link to="/orders" key={order.id} className="srv-track-row">
          <code>{order.code}</code>
          <span className="srv-track-name">{order.item_name}</span>
          <span className="srv-track-date">{formatDate(order.created_at)}</span>
          <span className={`order-status status-${order.status}`}>{STATUS_BY_KEY[order.status]?.label}</span>
        </Link>
      ))}
      <Link to="/orders" className="srv-btn srv-btn-ghost srv-track-all">
        View all orders
        <ArrowIcon />
      </Link>
    </div>
  )
}

function MinecraftServerPage() {
  const { user, loginWithDiscord } = useAuth()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState(undefined)
  const [catalog, setCatalog] = useState([])
  const [tab, setTab] = useState('rank')
  const [buying, setBuying] = useState(null)

  useEffect(() => {
    let active = true
    fetchServerStatus().then((s) => active && setStatus(s))
    fetchCatalog().then((items) => active && setCatalog(items))
    return () => {
      active = false
    }
  }, [])

  // returning from Discord sign-in with ?buy=<key> reopens that item
  useEffect(() => {
    const key = params.get('buy')
    if (!key || !catalog.length) return
    const item = catalog.find((i) => i.key === key)
    if (item) {
      setTab(item.kind)
      setBuying(item)
    }
    params.delete('buy')
    setParams(params, { replace: true })
  }, [params, catalog, setParams])

  const visible = useMemo(() => catalog.filter((i) => i.kind === tab), [catalog, tab])

  return (
    <div className="srv-page">
      <header className="srv-hero">
        <div className="srv-hero-copy">
          <span className="srv-kicker">Project Eden SMP</span>
          <h1>
            Join the
            <br />
            server
          </h1>
          <p>
            No website account needed. Add the address in Minecraft and you&apos;re in. Sign in only
            when you want to buy something.
          </p>
          <AddressBar />
          <div className="srv-hero-links">
            <a href="#how-to-join">How to join</a>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          </div>
        </div>
        <StatusConsole status={status} />
      </header>

      <Reveal as="section" className="srv-block" direction="fade" id="how-to-join" aria-labelledby="join-title">
        <div className="srv-block-head">
          <h2 id="join-title">How to join</h2>
          <p>Three steps, straight from the game. No launcher or sign-up.</p>
        </div>
        <ol className="srv-steps">
          {JOIN_STEPS.map(([title, body], i) => (
            <li key={title} style={{ '--i': i }}>
              <span className="srv-step-num">{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section" className="srv-block" direction="fade" aria-labelledby="features-title">
        <div className="srv-block-head">
          <h2 id="features-title">On the server</h2>
          <p>What a session on Project Eden looks like.</p>
        </div>
        <ul className="srv-features">
          {FEATURES.map(([key, title, body], i) => (
            <li key={key} style={{ '--i': i }}>
              <span className="srv-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  {FEATURE_ICONS[key]}
                </svg>
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="srv-block" direction="fade" id="store" aria-labelledby="store-title">
        <div className="srv-block-head srv-block-head-row">
          <div>
            <h2 id="store-title">Store</h2>
            <p>Ranks, cosmetics, and Eden Specialized commissions. Sign in with Discord to order.</p>
          </div>
          <div className="srv-tabs" role="tablist" aria-label="Store sections">
            {STORE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={tab === t.key ? 'is-active' : ''}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {!user && (
          <div className="srv-store-note">
            <span>You are browsing signed out. You will be asked to sign in when you order.</span>
          </div>
        )}

        <div className={`srv-store-grid tab-${tab}`} key={tab}>
          {visible.map((item, i) => (
            <div key={item.key} style={{ '--i': i }} className="srv-store-cell">
              <StoreCard item={item} onBuy={setBuying} />
            </div>
          ))}
        </div>

        {tab === 'commission' && (
          <p className="srv-store-foot">
            Want to see examples first? Browse the <Link to="/shop">Models page</Link>.
          </p>
        )}
      </Reveal>

      <Reveal as="section" className="srv-block srv-track" direction="fade" aria-labelledby="track-title">
        <div className="srv-block-head">
          <h2 id="track-title">Track your orders</h2>
          <p>Every order gets a code and a live status, from payment to delivery.</p>
        </div>
        <OrdersPreview user={user} onSignIn={() => loginWithDiscord('/server')} />
      </Reveal>

      {buying && (
        <OrderDialog
          item={buying}
          accent={buying.kind === 'commission' ? 'red' : 'green'}
          onClose={() => setBuying(null)}
        />
      )}
    </div>
  )
}

export default MinecraftServerPage
