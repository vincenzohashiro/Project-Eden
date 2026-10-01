import { supabase } from './supabase'

// Order lifecycle, in the order a typical order moves through it. Mirrors the
// status check in supabase/migrations/20261001000000_store_and_orders.sql.
export const ORDER_STATUSES = [
  { key: 'awaiting_quote', label: 'Awaiting quote', hint: 'We review your request and send a price on Discord.' },
  { key: 'awaiting_payment', label: 'Awaiting payment', hint: 'Open a ticket on Discord to pay. We confirm it here.' },
  { key: 'paid', label: 'Paid', hint: 'Payment confirmed. Your order is in the queue.' },
  { key: 'in_progress', label: 'In progress', hint: 'We are delivering or building your order.' },
  { key: 'delivered', label: 'Delivered', hint: 'Done. Check in-game or your Discord DMs.' },
  { key: 'cancelled', label: 'Cancelled', hint: 'This order was closed without delivery.' },
]

export const STATUS_BY_KEY = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, s]))

// the steps shown on a tracking timeline for a given order
export function timelineFor(order) {
  const steps = ['awaiting_payment', 'paid', 'in_progress', 'delivered']
  return order.kind === 'commission' ? ['awaiting_quote', ...steps] : steps
}

export function formatPrice(cents) {
  if (cents == null) return 'Quoted'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Shown when Supabase isn't configured (local dev without .env) so the store
// still renders. Keep in sync with the seed rows in the migration; the live
// catalog always comes from the store_items table.
export const FALLBACK_CATALOG = [
  { key: 'rank-settler', kind: 'rank', name: 'Settler', description: 'A first step up for regulars.', price_cents: 499, perks: ['Colored name in chat', 'Two extra homes', '/hat'] },
  { key: 'rank-vanguard', kind: 'rank', name: 'Vanguard', description: 'More room to build and trade.', price_cents: 999, perks: ['Everything in Settler', 'Five extra homes', 'Extra player shop slot'] },
  { key: 'rank-architect', kind: 'rank', name: 'Architect', description: 'The full set of perks.', price_cents: 1999, perks: ['Everything in Vanguard', 'Ten extra homes', 'Priority queue', 'Exclusive cosmetic set'] },
  { key: 'cos-trail-pack', kind: 'cosmetic', name: 'Particle trail pack', description: 'Three trails that follow you around the colony.', price_cents: 299, perks: [] },
  { key: 'cos-crate-keys', kind: 'cosmetic', name: 'Crate keys (x5)', description: 'Five keys for the cosmetic crates at spawn.', price_cents: 399, perks: [] },
  { key: 'cos-pet-drone', kind: 'cosmetic', name: 'Companion drone', description: 'A small drone pet that hovers beside you.', price_cents: 599, perks: [] },
  { key: 'com-minecraft-skins', kind: 'commission', name: 'Minecraft Skins', description: 'Player skins tailored to your character, from simple retextures to full overhauls.', price_cents: null, perks: [] },
  { key: 'com-custom-items', kind: 'commission', name: 'Custom Items', description: 'One-off item models built to spec for quests, cosmetics, or server events.', price_cents: null, perks: [] },
  { key: 'com-custom-tools', kind: 'commission', name: 'Custom Tools', description: 'Bespoke tool sets with matching CustomModelData.', price_cents: null, perks: [] },
  { key: 'com-furnitures', kind: 'commission', name: 'Furnitures', description: 'Functional furniture models: seating, storage, and decor.', price_cents: null, perks: [] },
  { key: 'com-plushies', kind: 'commission', name: 'Plushies', description: 'Soft, low-poly companion models for spawn rooms and player lounges.', price_cents: null, perks: [] },
  { key: 'com-tools', kind: 'commission', name: 'Tools', description: 'Pickaxes, hoes, and shears built for utility without sacrificing style.', price_cents: null, perks: [] },
  { key: 'com-gliders', kind: 'commission', name: 'Gliders', description: 'Custom elytra reskins.', price_cents: null, perks: [] },
  { key: 'com-weapons', kind: 'commission', name: 'Weapons', description: 'Blades, scythes, and sidearms for combat and boss events.', price_cents: null, perks: [] },
  { key: 'com-building', kind: 'commission', name: 'Building', description: 'Tool and block models for large-scale construction.', price_cents: null, perks: [] },
  { key: 'com-characters', kind: 'commission', name: 'Characters', description: 'Fully rigged humanoid and mob models.', price_cents: null, perks: [] },
]

// "Minecraft Skins" -> "com-minecraft-skins": maps a Models-page category to
// its commission catalog key
export const commissionKey = (label) => `com-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

export const ordersEnabled = Boolean(supabase)

export async function fetchCatalog() {
  if (!supabase) return FALLBACK_CATALOG
  const { data, error } = await supabase
    .from('store_items')
    .select('key, kind, name, description, price_cents, perks')
    .eq('active', true)
    .order('sort')
  if (error || !data?.length) return FALLBACK_CATALOG
  return data
}

export async function placeOrder({ itemKey, quantity, minecraftUsername, notes }) {
  if (!supabase) throw new Error('Ordering is not available right now.')
  // name/kind/price/status/code are filled in by the database trigger
  const { data, error } = await supabase
    .from('orders')
    .insert({
      item_key: itemKey,
      item_name: '',
      kind: '',
      quantity,
      minecraft_username: minecraftUsername?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

const ORDER_FIELDS = '*, order_events(id, status, note, created_at)'

export async function fetchMyOrders(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function fetchAllOrders() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_FIELDS)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)
  return data
}

export async function updateOrderStatus(orderId, status, staffNote) {
  if (!supabase) return
  const { error } = await supabase
    .from('orders')
    .update({ status, staff_note: staffNote?.trim() || null })
    .eq('id', orderId)
  if (error) throw new Error(error.message)
}

// calls onChange whenever any order (or its timeline) visible to this session
// changes; returns an unsubscribe function
export function subscribeToOrders(onChange) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`orders-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_events' }, onChange)
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
