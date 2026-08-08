import { Rcon } from 'rcon-client'
import { config } from '../config.js'

// Wings/Pterodactyl don't track Minecraft's in-game player list or moderation
// state (bans/ops/whitelist) — that's game-specific state, not something the
// daemon knows about — so player management goes over direct RCON rather
// than the Pterodactyl API. The interactive console itself is owned by
// pterodactylConsole.ts.

async function withRcon<T>(run: (rcon: Rcon) => Promise<T>): Promise<T> {
  const rcon = await Rcon.connect({
    host: config.MC_RCON_HOST,
    port: config.MC_RCON_PORT,
    password: config.MC_RCON_PASSWORD,
  })
  try {
    return await run(rcon)
  } finally {
    await rcon.end().catch(() => {})
  }
}

const LIST_RE = /There are (\d+) of a max(?:imum)? of (\d+) players online:?\s*(.*)/i

export interface PlayerList {
  online: number
  max: number
  names: string[]
}

function parsePlayerList(response: string): PlayerList {
  const match = LIST_RE.exec(response.trim())
  if (!match) return { online: 0, max: 0, names: [] }
  const [, online, max, namesPart] = match
  const names = namesPart ? namesPart.split(',').map((n) => n.trim()).filter(Boolean) : []
  return { online: Number(online), max: Number(max), names }
}

// null (not a thrown error) when RCON is unreachable — e.g. the server is
// stopped or still starting. Callers should treat that as "unknown", not fail.
export async function getPlayerList(): Promise<PlayerList | null> {
  try {
    return await withRcon((rcon) => rcon.send('list').then(parsePlayerList))
  } catch {
    return null
  }
}

// Player-action commands below throw on failure (RCON unreachable, or the
// command itself errors) — unlike getPlayerList these are user-initiated
// actions, so the route/frontend should surface the failure rather than
// silently treat it as "unknown".

export async function kickPlayer(name: string, reason?: string): Promise<string> {
  return withRcon((rcon) => rcon.send(reason ? `kick ${name} ${reason}` : `kick ${name}`))
}

export async function banPlayer(name: string, reason?: string): Promise<string> {
  return withRcon((rcon) => rcon.send(reason ? `ban ${name} ${reason}` : `ban ${name}`))
}

export async function pardonPlayer(name: string): Promise<string> {
  return withRcon((rcon) => rcon.send(`pardon ${name}`))
}

export async function opPlayer(name: string): Promise<string> {
  return withRcon((rcon) => rcon.send(`op ${name}`))
}

export async function deopPlayer(name: string): Promise<string> {
  return withRcon((rcon) => rcon.send(`deop ${name}`))
}

const WHITELIST_RE = /There are (?:no whitelisted players|(\d+) whitelisted players?:?\s*(.*))/i

export async function getWhitelist(): Promise<string[]> {
  return withRcon(async (rcon) => {
    const response = await rcon.send('whitelist list')
    const match = WHITELIST_RE.exec(response.trim())
    if (!match || !match[2]) return []
    return match[2].split(',').map((n) => n.trim()).filter(Boolean)
  })
}

export async function whitelistAdd(name: string): Promise<string> {
  return withRcon((rcon) => rcon.send(`whitelist add ${name}`))
}

export async function whitelistRemove(name: string): Promise<string> {
  return withRcon((rcon) => rcon.send(`whitelist remove ${name}`))
}
