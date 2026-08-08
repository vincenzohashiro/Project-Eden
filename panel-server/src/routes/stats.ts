import type { FastifyInstance } from 'fastify'
import { requireAdmin } from '../plugins/auth.js'
import { getPlayerList } from '../services/rcon.js'
import { getResources, getServerLimits } from '../services/pterodactyl.js'

// Pterodactyl's resources endpoint reports cumulative network bytes, not a
// rate — derive bytes/sec from the delta against the previous poll. Module
// state is fine given panel-server runs as a single instance.
let previousSample: { at: number; rxBytes: number; txBytes: number } | null = null

function computeNetworkRate(rxBytes: number, txBytes: number) {
  const now = Date.now()
  if (!previousSample) {
    previousSample = { at: now, rxBytes, txBytes }
    return { rxBytesPerSec: 0, txBytesPerSec: 0 }
  }

  const elapsedSeconds = (now - previousSample.at) / 1000
  const rate =
    elapsedSeconds > 0
      ? {
          rxBytesPerSec: Math.max(0, (rxBytes - previousSample.rxBytes) / elapsedSeconds),
          txBytesPerSec: Math.max(0, (txBytes - previousSample.txBytes) / elapsedSeconds),
        }
      : { rxBytesPerSec: 0, txBytesPerSec: 0 }

  previousSample = { at: now, rxBytes, txBytes }
  return rate
}

// requireAdmin, not requireAuth — infra-level CPU/mem/disk numbers are more
// sensitive than the plain online/offline status any signed-in user sees,
// and the whole EdenEngine dashboard is already admin-gated on the frontend.
export async function statsRoutes(app: FastifyInstance) {
  app.get('/api/stats', { preHandler: requireAdmin }, async () => {
    const [attrs, limits, players] = await Promise.all([getResources(), getServerLimits(), getPlayerList()])
    const r = attrs.resources
    const network = computeNetworkRate(r.network_rx_bytes, r.network_tx_bytes)

    return {
      cpuPercent: r.cpu_absolute,
      cpuLimitPercent: limits.cpuLimitPercent,
      memory: { usedBytes: r.memory_bytes, totalBytes: limits.memoryBytes },
      disk: { usedBytes: r.disk_bytes, totalBytes: limits.diskBytes },
      network,
      players,
    }
  })
}
