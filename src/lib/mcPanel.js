import { panelFetch } from './panelFetch'

export const getServerStatus = () => panelFetch('/api/status')
export const getServerStats = () => panelFetch('/api/stats')
export const startServer = () => panelFetch('/api/power/start', { method: 'POST' })
export const stopServer = () => panelFetch('/api/power/stop', { method: 'POST' })
export const restartServer = () => panelFetch('/api/power/restart', { method: 'POST' })
export const killServer = () => panelFetch('/api/power/kill', { method: 'POST' })
export const getConsoleTicket = () => panelFetch('/api/console/ticket', { method: 'POST' })
