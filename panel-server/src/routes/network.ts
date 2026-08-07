import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import {
  assignAllocation,
  listAllocations,
  removeAllocation,
  setPrimaryAllocation,
  updateAllocationNotes,
} from '../services/pterodactylNetwork.js'

export async function networkRoutes(app: FastifyInstance) {
  app.get('/api/network', { preHandler: requireAdmin }, async () => ({ allocations: await listAllocations() }))

  app.post('/api/network', { preHandler: requireAdmin }, async () => assignAllocation())

  app.post('/api/network/:id/primary', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await setPrimaryAllocation(Number(id))
    return reply.code(204).send()
  })

  app.patch('/api/network/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { notes } = request.body as { notes: string }
    await updateAllocationNotes(Number(id), notes)
    return reply.code(204).send()
  })

  app.delete('/api/network/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await removeAllocation(Number(id))
    return reply.code(204).send()
  })
}
