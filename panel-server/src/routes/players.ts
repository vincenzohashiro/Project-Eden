import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import {
  banPlayer,
  deopPlayer,
  getPlayerList,
  getWhitelist,
  kickPlayer,
  opPlayer,
  pardonPlayer,
  whitelistAdd,
  whitelistRemove,
} from '../services/rcon.js'

export async function playersRoutes(app: FastifyInstance) {
  app.get('/api/players', { preHandler: requireAdmin }, async () => ({ players: await getPlayerList() }))

  app.get('/api/players/whitelist', { preHandler: requireAdmin }, async () => ({ names: await getWhitelist() }))

  app.post('/api/players/kick', { preHandler: requireAdmin }, async (request) => {
    const { name, reason } = request.body as { name: string; reason?: string }
    return { message: await kickPlayer(name, reason) }
  })

  app.post('/api/players/ban', { preHandler: requireAdmin }, async (request) => {
    const { name, reason } = request.body as { name: string; reason?: string }
    return { message: await banPlayer(name, reason) }
  })

  app.post('/api/players/pardon', { preHandler: requireAdmin }, async (request) => {
    const { name } = request.body as { name: string }
    return { message: await pardonPlayer(name) }
  })

  app.post('/api/players/op', { preHandler: requireAdmin }, async (request) => {
    const { name } = request.body as { name: string }
    return { message: await opPlayer(name) }
  })

  app.post('/api/players/deop', { preHandler: requireAdmin }, async (request) => {
    const { name } = request.body as { name: string }
    return { message: await deopPlayer(name) }
  })

  app.post('/api/players/whitelist', { preHandler: requireAdmin }, async (request) => {
    const { name } = request.body as { name: string }
    return { message: await whitelistAdd(name) }
  })

  app.delete('/api/players/whitelist/:name', { preHandler: requireAdmin }, async (request) => {
    const { name } = request.params as { name: string }
    return { message: await whitelistRemove(name) }
  })
}
