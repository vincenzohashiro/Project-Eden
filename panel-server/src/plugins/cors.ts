import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'

export async function registerCors(app: FastifyInstance) {
  await app.register(cors, {
    origin: config.ALLOWED_ORIGINS,
    // Every HTTP verb actually used across the API — PUT (rename, startup
    // variables), PATCH (subusers, network notes), DELETE (databases,
    // backups, files, subusers, network, whitelist). Browsers preflight
    // these; curl doesn't, which is how this stayed hidden until a real
    // browser click on Settings' rename button surfaced it.
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
}
