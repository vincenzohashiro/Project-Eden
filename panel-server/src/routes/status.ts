import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../plugins/auth.js'
import { getResources, type ServerState } from '../services/pterodactyl.js'

const STATE_MAP: Record<ServerState, 'starting' | 'running' | 'stopping' | 'stopped'> = {
  starting: 'starting',
  running: 'running',
  stopping: 'stopping',
  offline: 'stopped',
}

export async function statusRoutes(app: FastifyInstance) {
  app.get('/api/status', { preHandler: requireAuth }, async () => {
    const attrs = await getResources()
    const state = STATE_MAP[attrs.current_state]
    const lastChangedAt =
      attrs.current_state === 'running' ? new Date(Date.now() - attrs.resources.uptime).toISOString() : null
    return { state, lastChangedAt }
  })
}
