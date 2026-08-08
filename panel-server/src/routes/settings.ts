import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { getAccountUsername, getServerDetails, reinstallServer, renameServer } from '../services/pterodactylSettings.js'

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/api/settings', { preHandler: requireAdmin }, async () => {
    const [details, sftpUsername] = await Promise.all([getServerDetails(), getAccountUsername()])
    return { ...details, sftpUsername: `${sftpUsername}.${details.identifier}` }
  })

  app.put('/api/settings/rename', { preHandler: requireAdmin }, async (request, reply) => {
    const { name, description } = request.body as { name: string; description: string }
    await renameServer(name, description)
    return reply.code(204).send()
  })

  app.post('/api/settings/reinstall', { preHandler: requireAdmin }, async (_request, reply) => {
    await reinstallServer()
    return reply.code(204).send()
  })
}
