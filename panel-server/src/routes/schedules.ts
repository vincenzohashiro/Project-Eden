import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import {
  createSchedule,
  createTask,
  deleteSchedule,
  deleteTask,
  executeSchedule,
  listSchedules,
  updateSchedule,
  type ScheduleInput,
} from '../services/pterodactylSchedules.js'

export async function schedulesRoutes(app: FastifyInstance) {
  app.get('/api/schedules', { preHandler: requireAdmin }, async () => ({ schedules: await listSchedules() }))

  app.post('/api/schedules', { preHandler: requireAdmin }, async (request) => {
    return createSchedule(request.body as ScheduleInput)
  })

  app.patch('/api/schedules/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await updateSchedule(Number(id), request.body as ScheduleInput)
    return reply.code(204).send()
  })

  app.delete('/api/schedules/:id', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await deleteSchedule(Number(id))
    return reply.code(204).send()
  })

  app.post('/api/schedules/:id/execute', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await executeSchedule(Number(id))
    return reply.code(204).send()
  })

  app.post('/api/schedules/:id/tasks', { preHandler: requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { action, payload, timeOffset } = request.body as {
      action: 'command' | 'power' | 'backup'
      payload: string
      timeOffset: number
    }
    await createTask(Number(id), action, payload, timeOffset)
    return reply.code(204).send()
  })

  app.delete('/api/schedules/:id/tasks/:taskId', { preHandler: requireAdmin }, async (request, reply) => {
    const { id, taskId } = request.params as { id: string; taskId: string }
    await deleteTask(Number(id), Number(taskId))
    return reply.code(204).send()
  })
}
