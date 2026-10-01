export const SERVER_ADDRESS = 'play.projecteden.net'
export const SERVER_VERSION = '1.21.11'
export const SERVER_LOADER = 'Fabric'

// Public Minecraft status lookup (mcsrvstat.us, CORS-enabled, cached ~1 min on
// their side). Resolves to null if the lookup itself fails, so callers can
// show "status unavailable" rather than a false "offline".
export async function fetchServerStatus(address = SERVER_ADDRESS) {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      online: Boolean(data.online),
      players: data.players?.online ?? null,
      maxPlayers: data.players?.max ?? null,
      motd: data.motd?.clean?.join(' ') ?? null,
    }
  } catch {
    return null
  }
}
