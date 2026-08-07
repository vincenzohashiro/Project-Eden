import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { consumeTicket, issueTicket } from '../services/consoleTickets.js'
import * as pterodactylConsole from '../services/pterodactylConsole.js'

async function requireTicket(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ticket = (request.query as { ticket?: string }).ticket
  const userId = ticket ? consumeTicket(ticket) : null
  if (!userId) {
    reply.code(401).send({ error: 'invalid or expired ticket' })
  }
}

interface ClientCommandMessage {
  type: 'command'
  command: string
}

function parseCommandMessage(raw: unknown): ClientCommandMessage | null {
  try {
    const data = JSON.parse(String(raw))
    if (data?.type === 'command' && typeof data.command === 'string') return data
    return null
  } catch {
    return null
  }
}

export async function consoleRoutes(app: FastifyInstance) {
  app.post('/api/console/ticket', { preHandler: requireAdmin }, async (request) => {
    return { ticket: issueTicket(request.user!.id) }
  })

  // Console output is a raw stdin/stdout pipe via Wings, not RCON — sending a
  // command has no structured reply, so we don't wait for or echo one here.
  // Output just shows up asynchronously as ordinary log lines, same as any
  // other console line (the frontend echoes the typed command optimistically).
  app.get('/api/console/ws', { websocket: true, preHandler: requireTicket }, (socket) => {
    const { backlog, unsubscribe } = pterodactylConsole.subscribe((line) => {
      if (socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: 'log', line }))
    })
    socket.send(JSON.stringify({ type: 'backlog', lines: backlog }))

    socket.on('message', (raw: unknown) => {
      const message = parseCommandMessage(raw)
      if (!message) return
      pterodactylConsole.sendCommand(message.command.slice(0, 256))
    })

    socket.on('close', unsubscribe)
    socket.on('error', unsubscribe)
  })
}
