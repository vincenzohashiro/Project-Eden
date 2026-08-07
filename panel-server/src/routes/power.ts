import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { sendPower } from '../services/pterodactyl.js'

export async function powerRoutes(app: FastifyInstance) {
  app.post('/api/power/start', { preHandler: requireAdmin }, async (_req, reply) => {
    await sendPower('start')
    return reply.code(202).send({ state: 'starting' })
  })

  app.post('/api/power/stop', { preHandler: requireAdmin }, async (_req, reply) => {
    await sendPower('stop')
    return reply.code(202).send({ state: 'stopping' })
  })

  app.post('/api/power/restart', { preHandler: requireAdmin }, async (_req, reply) => {
    await sendPower('restart')
    return reply.code(202).send({ state: 'starting' })
  })

  app.post('/api/power/kill', { preHandler: requireAdmin }, async (_req, reply) => {
    await sendPower('kill')
    return reply.code(202).send({ state: 'stopped' })
  })
}
