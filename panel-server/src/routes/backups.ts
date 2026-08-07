import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import {
  createBackup,
  deleteBackup,
  getBackupDownloadUrl,
  listBackups,
  restoreBackup,
  toggleBackupLock,
} from '../services/pterodactylBackups.js'

export async function backupsRoutes(app: FastifyInstance) {
  app.get('/api/backups', { preHandler: requireAdmin }, async () => ({ backups: await listBackups() }))

  app.post('/api/backups', { preHandler: requireAdmin }, async (request) => {
    const { name } = (request.body as { name?: string } | undefined) ?? {}
    return createBackup(name)
  })

  app.get('/api/backups/:id/download-url', { preHandler: requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    return { url: await getBackupDownloadUrl(id) }
  })

  app.delete('/api/backups/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await deleteBackup(id)
    return reply.code(204).send()
  })

  app.post('/api/backups/:id/restore', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await restoreBackup(id)
    return reply.code(202).send()
  })

  app.post('/api/backups/:id/lock', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await toggleBackupLock(id)
    return reply.code(204).send()
  })
}
