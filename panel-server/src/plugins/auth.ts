import type { FastifyReply, FastifyRequest } from 'fastify'
import { InvalidTokenError, verifyAccessToken, type VerifiedUser } from '../lib/jwt.js'
import { getCachedRole } from '../services/roleCache.js'
import { fetchUserRole } from '../services/supabaseAdmin.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: VerifiedUser
  }
}

async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'missing bearer token' })
    return false
  }
  try {
    request.user = await verifyAccessToken(header.slice('Bearer '.length))
    return true
  } catch (err) {
    if (err instanceof InvalidTokenError) {
      reply.code(401).send({ error: 'invalid token' })
      return false
    }
    throw err
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply)
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authenticated = await authenticate(request, reply)
  if (!authenticated) return

  const role = await getCachedRole(request.user!.id, () => fetchUserRole(request.user!.id))
  if (role !== 'admin') {
    reply.code(403).send({ error: 'admin role required' })
  }
}
