import { Rcon } from 'rcon-client'
import { config } from '../config.js'

// Wings/Pterodactyl don't track Minecraft's in-game player list (that's
// game-specific state, not something the daemon knows about), so this is
// the one thing still fetched via direct RCON rather than the Pterodactyl
// API. The interactive console itself is owned by pterodactylConsole.ts.

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
  let rcon: Rcon
  try {
    rcon = await Rcon.connect({
      host: config.MC_RCON_HOST,
      port: config.MC_RCON_PORT,
      password: config.MC_RCON_PASSWORD,
    })
  } catch {
    return null
  }

  try {
    return parsePlayerList(await rcon.send('list'))
  } catch {
    return null
  } finally {
    await rcon.end().catch(() => {})
  }
}
