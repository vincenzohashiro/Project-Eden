import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export type ServerState = 'starting' | 'running' | 'stopping' | 'offline'

interface ResourcesResponse {
  attributes: {
    current_state: ServerState
    is_suspended: boolean
    resources: {
      memory_bytes: number
      cpu_absolute: number
      disk_bytes: number
      network_rx_bytes: number
      network_tx_bytes: number
      uptime: number
    }
  }
}

export async function getResources() {
  const data = await pteroFetch<ResourcesResponse>(`/servers/${SERVER_ID}/resources`)
  return data!.attributes
}

export type PowerSignal = 'start' | 'stop' | 'restart' | 'kill'

export async function sendPower(signal: PowerSignal): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/power`, {
    method: 'POST',
    body: JSON.stringify({ signal }),
  })
}

interface WebsocketCredentialsResponse {
  data: { token: string; socket: string }
}

export async function getWebsocketCredentials() {
  const data = await pteroFetch<WebsocketCredentialsResponse>(`/servers/${SERVER_ID}/websocket`)
  return data!.data
}

interface ServerDetailsResponse {
  attributes: {
    limits: { memory: number; disk: number; cpu: number }
  }
}

interface ServerLimits {
  memoryBytes: number
  diskBytes: number
}

const LIMITS_TTL_MS = 5 * 60_000
let limitsCache: { value: ServerLimits; expiresAt: number } | null = null

export async function getServerLimits(): Promise<ServerLimits> {
  if (limitsCache && limitsCache.expiresAt > Date.now()) return limitsCache.value

  const data = await pteroFetch<ServerDetailsResponse>(`/servers/${SERVER_ID}`)
  const value: ServerLimits = {
    memoryBytes: data!.attributes.limits.memory * 1024 * 1024,
    diskBytes: data!.attributes.limits.disk * 1024 * 1024,
  }
  limitsCache = { value, expiresAt: Date.now() + LIMITS_TTL_MS }
  return value
}
