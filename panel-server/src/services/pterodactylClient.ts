import { config } from '../config.js'

export const BASE = `${config.PTERODACTYL_PANEL_URL}/api/client`
export const SERVER_ID = config.PTERODACTYL_SERVER_ID

export async function pteroFetch<T>(path: string, opts: RequestInit = {}): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${config.PTERODACTYL_API_KEY}`,
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers,
    },
  })
  if (!res.ok) throw new Error(`pterodactyl API ${path} -> ${res.status}`)
  if (res.status === 204) return null
  return res.json() as Promise<T>
}

// For endpoints that return the raw file body instead of a JSON envelope
// (e.g. GET /files/contents).
export async function pteroFetchText(path: string, opts: RequestInit = {}): Promise<string> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${config.PTERODACTYL_API_KEY}`,
      ...(opts.body ? { 'Content-Type': 'text/plain' } : {}),
      ...opts.headers,
    },
  })
  if (!res.ok) throw new Error(`pterodactyl API ${path} -> ${res.status}`)
  return res.text()
}
