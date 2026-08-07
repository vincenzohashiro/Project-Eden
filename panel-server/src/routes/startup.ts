import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { getStartupVariables, updateStartupVariable } from '../services/pterodactylStartup.js'

export async function startupRoutes(app: FastifyInstance) {
  app.get('/api/startup', { preHandler: requireAdmin }, async () => ({ variables: await getStartupVariables() }))

  app.put('/api/startup/variable', { preHandler: requireAdmin }, async (request, reply) => {
    const { key, value } = request.body as { key: string; value: string }
    await updateStartupVariable(key, value)
    return reply.code(204).send()
  })
}
