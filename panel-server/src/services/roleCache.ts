const TTL_MS = 45_000

interface CacheEntry {
  role: string | null
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

export async function getCachedRole(
  userId: string,
  fetchRole: () => Promise<string | null>,
): Promise<string | null> {
  const entry = cache.get(userId)
  if (entry && entry.expiresAt > Date.now()) return entry.role

  const role = await fetchRole()
  cache.set(userId, { role, expiresAt: Date.now() + TTL_MS })
  return role
}
