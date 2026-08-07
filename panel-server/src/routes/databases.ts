import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { createDatabase, deleteDatabase, listDatabases, rotatePassword } from '../services/pterodactylDatabases.js'

export async function databasesRoutes(app: FastifyInstance) {
  app.get('/api/databases', { preHandler: requireAdmin }, async () => ({ databases: await listDatabases() }))

  app.post('/api/databases', { preHandler: requireAdmin }, async (request) => {
    const { database, remote } = request.body as { database: string; remote?: string }
    return createDatabase(database, remote ?? '%')
  })

  app.post('/api/databases/:id/rotate-password', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    return rotatePassword(id)
  })

  app.delete('/api/databases/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await deleteDatabase(id)
    return reply.code(204).send()
  })
}
