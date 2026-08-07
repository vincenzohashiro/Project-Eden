import { panelFetch } from './panelFetch'

export const listDatabases = () => panelFetch('/api/databases')
export const createDatabase = (database, remote) =>
  panelFetch('/api/databases', { method: 'POST', body: JSON.stringify({ database, remote }) })
export const rotatePassword = (id) => panelFetch(`/api/databases/${id}/rotate-password`, { method: 'POST' })
export const deleteDatabase = (id) => panelFetch(`/api/databases/${id}`, { method: 'DELETE' })
