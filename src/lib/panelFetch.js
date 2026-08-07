import { supabase } from './supabase'

const PANEL_API_URL = import.meta.env.VITE_MC_PANEL_URL

async function getAccessToken() {
  if (!supabase) return null
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

async function request(path, opts, contentType) {
  if (!PANEL_API_URL) return null
  const token = await getAccessToken()
  if (!token) return null

  const res = await fetch(`${PANEL_API_URL}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.body ? { 'Content-Type': contentType } : {}),
      ...opts.headers,
    },
  })
  if (!res.ok) {
    const error = new Error(`panel API ${res.status}`)
    error.status = res.status
    throw error
  }
  return res
}

export async function panelFetch(path, opts = {}) {
  const res = await request(path, opts, 'application/json')
  if (!res || res.status === 204) return null
  return res.json()
}

export async function panelFetchText(path, opts = {}) {
  const res = await request(path, opts, 'text/plain')
  if (!res || res.status === 204) return null
  return res.text()
}
