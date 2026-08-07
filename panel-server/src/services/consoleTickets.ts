import { randomBytes } from 'node:crypto'

// Browsers can't set an Authorization header on a WebSocket upgrade, so the
// console WS is authorized via a short-lived, single-use ticket instead:
// the browser mints one via the normal Bearer-authenticated REST call
// (POST /api/console/ticket, requireAdmin), then passes it as a query param
// on the WS connect. Never a long-lived credential in a URL.
const TTL_MS = 15_000

interface TicketEntry {
  userId: string
  expiresAt: number
}

const tickets = new Map<string, TicketEntry>()

export function issueTicket(userId: string): string {
  const ticket = randomBytes(24).toString('base64url')
  tickets.set(ticket, { userId, expiresAt: Date.now() + TTL_MS })
  return ticket
}

export function consumeTicket(ticket: string): string | null {
  const entry = tickets.get(ticket)
  if (!entry) return null
  tickets.delete(ticket)
  if (entry.expiresAt < Date.now()) return null
  return entry.userId
}
