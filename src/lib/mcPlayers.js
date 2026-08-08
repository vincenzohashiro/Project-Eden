import { panelFetch } from './panelFetch'

export const getPlayers = () => panelFetch('/api/players')
export const getWhitelist = () => panelFetch('/api/players/whitelist')
export const kickPlayer = (name, reason) =>
  panelFetch('/api/players/kick', { method: 'POST', body: JSON.stringify({ name, reason }) })
export const banPlayer = (name, reason) =>
  panelFetch('/api/players/ban', { method: 'POST', body: JSON.stringify({ name, reason }) })
export const pardonPlayer = (name) => panelFetch('/api/players/pardon', { method: 'POST', body: JSON.stringify({ name }) })
export const opPlayer = (name) => panelFetch('/api/players/op', { method: 'POST', body: JSON.stringify({ name }) })
export const deopPlayer = (name) => panelFetch('/api/players/deop', { method: 'POST', body: JSON.stringify({ name }) })
export const whitelistAdd = (name) =>
  panelFetch('/api/players/whitelist', { method: 'POST', body: JSON.stringify({ name }) })
export const whitelistRemove = (name) =>
  panelFetch(`/api/players/whitelist/${encodeURIComponent(name)}`, { method: 'DELETE' })
