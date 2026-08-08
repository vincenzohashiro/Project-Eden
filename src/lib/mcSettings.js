import { panelFetch } from './panelFetch'

export const getServerSettings = () => panelFetch('/api/settings')
export const renameServer = (name, description) =>
  panelFetch('/api/settings/rename', { method: 'PUT', body: JSON.stringify({ name, description }) })
export const reinstallServer = () => panelFetch('/api/settings/reinstall', { method: 'POST' })
