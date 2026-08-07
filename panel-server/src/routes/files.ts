import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import {
  copyFile,
  createFolder,
  deleteFiles,
  getDownloadUrl,
  getUploadUrl,
  listFiles,
  readFile,
  renameFile,
  writeFile,
} from '../services/pterodactylFiles.js'

export async function filesRoutes(app: FastifyInstance) {
  app.get('/api/files', { preHandler: requireAdmin }, async (request) => {
    const { directory } = request.query as { directory?: string }
    return { files: await listFiles(directory ?? '/') }
  })

  app.get('/api/files/content', { preHandler: requireAdmin }, async (request, reply) => {
    const { file } = request.query as { file?: string }
    if (!file) return reply.code(400).send({ error: 'file is required' })
    const content = await readFile(file)
    return reply.type('text/plain').send(content)
  })

  app.put('/api/files/content', { preHandler: requireAdmin }, async (request, reply) => {
    const { file } = request.query as { file?: string }
    if (!file) return reply.code(400).send({ error: 'file is required' })
    await writeFile(file, request.body as string)
    return reply.code(204).send()
  })

  app.post('/api/files/folder', { preHandler: requireAdmin }, async (request, reply) => {
    const { root, name } = request.body as { root: string; name: string }
    await createFolder(root, name)
    return reply.code(204).send()
  })

  app.put('/api/files/rename', { preHandler: requireAdmin }, async (request, reply) => {
    const { root, from, to } = request.body as { root: string; from: string; to: string }
    await renameFile(root, from, to)
    return reply.code(204).send()
  })

  app.delete('/api/files', { preHandler: requireAdmin }, async (request, reply) => {
    const { root, files } = request.body as { root: string; files: string[] }
    await deleteFiles(root, files)
    return reply.code(204).send()
  })

  app.post('/api/files/copy', { preHandler: requireAdmin }, async (request, reply) => {
    const { location } = request.body as { location: string }
    await copyFile(location)
    return reply.code(204).send()
  })

  app.get('/api/files/upload-url', { preHandler: requireAdmin }, async (request) => {
    const { directory } = request.query as { directory?: string }
    return { url: await getUploadUrl(directory ?? '/') }
  })

  app.get('/api/files/download-url', { preHandler: requireAdmin }, async (request, reply) => {
    const { file } = request.query as { file?: string }
    if (!file) return reply.code(400).send({ error: 'file is required' })
    return { url: await getDownloadUrl(file) }
  })
}
