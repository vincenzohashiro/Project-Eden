import websocket from '@fastify/websocket'
import Fastify from 'fastify'
import { config } from './config.js'
import { registerCors } from './plugins/cors.js'
import { registerRateLimit } from './plugins/rateLimit.js'
import { backupsRoutes } from './routes/backups.js'
import { consoleRoutes } from './routes/console.js'
import { databasesRoutes } from './routes/databases.js'
import { filesRoutes } from './routes/files.js'
import { healthRoutes } from './routes/health.js'
import { networkRoutes } from './routes/network.js'
import { playersRoutes } from './routes/players.js'
import { powerRoutes } from './routes/power.js'
import { schedulesRoutes } from './routes/schedules.js'
import { settingsRoutes } from './routes/settings.js'
import { startupRoutes } from './routes/startup.js'
import { statsRoutes } from './routes/stats.js'
import { statusRoutes } from './routes/status.js'
import { subusersRoutes } from './routes/subusers.js'

const app = Fastify({
  logger: process.env.NODE_ENV === 'production' ? true : { transport: { target: 'pino-pretty' } },
})

await registerCors(app)
await registerRateLimit(app)
await app.register(websocket)

await app.register(healthRoutes)
await app.register(statusRoutes)
await app.register(powerRoutes)
await app.register(statsRoutes)
await app.register(consoleRoutes)
await app.register(filesRoutes)
await app.register(databasesRoutes)
await app.register(schedulesRoutes)
await app.register(backupsRoutes)
await app.register(networkRoutes)
await app.register(startupRoutes)
await app.register(subusersRoutes)
await app.register(settingsRoutes)
await app.register(playersRoutes)

try {
  // 127.0.0.1 only — nginx is the sole internet-facing entry point in production.
  await app.listen({ port: config.PANEL_PORT, host: '127.0.0.1' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
