import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(rateLimit, {
    // Background status (6/min) + stats (12/min) polling alone eats 18/min —
    // this needs headroom for actual admin actions on top of that, not just
    // idle polling. Still meaningful protection since every route here is
    // already admin-gated (this isn't multi-tenant fairness, it's a backstop
    // against a buggy/compromised client hammering the Pterodactyl API).
    max: 120,
    timeWindow: '1 minute',
  })
}
