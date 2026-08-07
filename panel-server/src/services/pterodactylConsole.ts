import WebSocket from 'ws'
import { logger } from '../lib/logger.js'
import { getWebsocketCredentials } from './pterodactyl.js'

// Single shared Wings connection multiplexed to every connected admin —
// mirrors the shared-broadcaster shape a spawned-process log tail would use,
// just with a Wings websocket as the upstream instead of a child process.

const BACKLOG_LINES = 200
const RECONNECT_DELAY_MS = 3000

type Listener = (line: string) => void

let socket: WebSocket | null = null
let authed = false
let connecting: Promise<void> | null = null
const listeners = new Set<Listener>()
let backlog: string[] = []

function scheduleReconnect() {
  setTimeout(() => {
    if (listeners.size > 0) connect().catch((err) => logger.error({ err }, 'pterodactylConsole: reconnect failed'))
  }, RECONNECT_DELAY_MS)
}

async function refreshAuth() {
  try {
    const { token } = await getWebsocketCredentials()
    socket?.send(JSON.stringify({ event: 'auth', args: [token] }))
  } catch (err) {
    logger.error({ err }, 'pterodactylConsole: token refresh failed')
  }
}

function handleMessage(raw: WebSocket.RawData) {
  let message: { event?: string; args?: string[] }
  try {
    message = JSON.parse(raw.toString())
  } catch {
    return
  }

  if (message.event === 'auth success') {
    authed = true
    socket?.send(JSON.stringify({ event: 'send logs', args: [] }))
    return
  }

  if (message.event === 'console output') {
    const line = message.args?.[0]
    if (line == null) return
    backlog.push(line)
    if (backlog.length > BACKLOG_LINES) backlog.shift()
    for (const listener of listeners) listener(line)
    return
  }

  if (message.event === 'token expiring' || message.event === 'token expired') {
    refreshAuth()
  }
}

function connect(): Promise<void> {
  if (connecting) return connecting

  connecting = (async () => {
    const { token, socket: url } = await getWebsocketCredentials()
    const ws = new WebSocket(url)
    socket = ws
    authed = false

    ws.on('open', () => ws.send(JSON.stringify({ event: 'auth', args: [token] })))
    ws.on('message', handleMessage)
    ws.on('close', () => {
      authed = false
      socket = null
      scheduleReconnect()
    })
    ws.on('error', (err) => logger.error({ err }, 'pterodactylConsole: socket error'))

    await new Promise<void>((resolve, reject) => {
      ws.once('open', () => resolve())
      ws.once('error', reject)
    })
  })().finally(() => {
    connecting = null
  })

  return connecting
}

export function subscribe(listener: Listener): { backlog: string[]; unsubscribe: () => void } {
  listeners.add(listener)
  if (!socket) connect().catch((err) => logger.error({ err }, 'pterodactylConsole: connect failed'))

  return {
    backlog: [...backlog],
    unsubscribe: () => listeners.delete(listener),
  }
}

export function sendCommand(command: string): void {
  if (socket && authed) {
    socket.send(JSON.stringify({ event: 'send command', args: [command] }))
  }
}
