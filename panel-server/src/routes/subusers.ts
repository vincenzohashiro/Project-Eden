import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { createSubuser, listSubusers, removeSubuser, updateSubuserPermissions } from '../services/pterodactylSubusers.js'

export async function subusersRoutes(app: FastifyInstance) {
  app.get('/api/subusers', { preHandler: requireAdmin }, async () => ({ subusers: await listSubusers() }))

  app.post('/api/subusers', { preHandler: requireAdmin }, async (request) => {
    const { email, permissions } = request.body as { email: string; permissions: string[] }
    return createSubuser(email, permissions)
  })

  app.patch('/api/subusers/:uuid', { preHandler: requireAdmin }, async (request) => {
    const { uuid } = request.params as { uuid: string }
    const { permissions } = request.body as { permissions: string[] }
    return updateSubuserPermissions(uuid, permissions)
  })

  app.delete('/api/subusers/:uuid', { preHandler: requireAdmin }, async (request, reply) => {
    const { uuid } = request.params as { uuid: string }
    await removeSubuser(uuid)
    return reply.code(204).send()
  })
}
