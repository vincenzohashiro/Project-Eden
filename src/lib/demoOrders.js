import { FALLBACK_CATALOG } from './store'

// Sample orders for previewing the admin panel in local dev when Supabase
// isn't configured. Never used in production builds.

const BUYERS = [
  ['Azuri', 'Azuri_'],
  ['Dreiwhite', 'Dreiwhite'],
  ['Havi', 'HaviMC'],
  ['Fernn_', 'Fernn_'],
  ['Sikatu', 'Sikatu'],
  ['Zenshin', 'ZenshinPH'],
  ['Hiraya SMP', 'HirayaAdmin'],
  ['Lemoncraft', 'LemonOwner'],
]

const NOTES = [
  'Sword with a glowing runic blade, see refs in ticket.',
  'Matching set for our spawn lobby.',
  null,
  'Paper 1.21.4. Needs CustomModelData 1001+.',
  null,
  'Pastel palette please.',
]

// small seeded PRNG so the preview looks the same on every reload
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const QUOTES = { 'com-minecraft-skins': 5000, 'com-furnitures': 2500, 'com-plushies': 6000, 'com-weapons': 12000 }
const DAY = 86400000
const HOUR = 3600000

export function makeDemoOrders(count = 46) {
  const rand = rng(7)
  const now = Date.now()
  const orders = []

  for (let i = 0; i < count; i++) {
    const item = FALLBACK_CATALOG[Math.floor(rand() * FALLBACK_CATALOG.length)]
    const [username, mc] = BUYERS[Math.floor(rand() * BUYERS.length)]
    const created = now - Math.floor(rand() ** 1.6 * 75 * DAY) - Math.floor(rand() * 12 * HOUR)
    const commission = item.kind === 'commission'
    const price = commission ? (QUOTES[item.key] ?? 8000 + Math.floor(rand() * 8) * 1000) : item.price_cents

    // older orders are further along
    const age = (now - created) / DAY
    const path = commission
      ? ['awaiting_quote', 'awaiting_payment', 'paid', 'in_progress', 'delivered']
      : ['awaiting_payment', 'paid', 'in_progress', 'delivered']
    let reach = Math.min(path.length - 1, Math.floor(age / (commission ? 4 : 1.5) + rand() * 1.5))
    const cancelled = rand() < 0.08
    if (cancelled) reach = Math.min(reach, 1)

    const events = []
    let t = created
    for (let s = 0; s <= reach; s++) {
      events.push({ id: `${i}-${s}`, status: path[s], note: null, created_at: new Date(t).toISOString() })
      const next = t + (commission ? 1 + rand() * 4 : 0.2 + rand()) * DAY
      // stop where "now" catches up with this order
      if (next > now) {
        reach = s
        break
      }
      t = next
    }
    let status = path[reach]
    if (cancelled) {
      status = 'cancelled'
      events.push({ id: `${i}-x`, status, note: 'Buyer withdrew the request.', created_at: new Date(Math.min(now, t + 6 * HOUR)).toISOString() })
    }

    const quoted = !commission || reach >= 1
    orders.push({
      id: `demo-${i}`,
      code: `EDN-${(0xa1b2c3 + i * 7919).toString(16).toUpperCase().slice(-6)}`,
      user_id: `user-${username}`,
      item_key: item.key,
      item_name: item.name,
      kind: item.kind,
      quantity: item.kind === 'cosmetic' ? 1 + Math.floor(rand() * 3) : 1,
      price_cents: quoted ? price : null,
      minecraft_username: commission && rand() < 0.5 ? null : mc,
      notes: commission ? NOTES[i % NOTES.length] : null,
      status,
      staff_note: cancelled ? 'Buyer withdrew the request.' : null,
      created_at: new Date(created).toISOString(),
      updated_at: events.at(-1).created_at,
      order_events: events,
      profile: { id: `user-${username}`, username, discord_username: username, avatar_url: null },
    })
  }

  return orders.sort((a, b) => b.created_at.localeCompare(a.created_at))
}
