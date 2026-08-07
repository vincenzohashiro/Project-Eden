import { panelFetch } from './panelFetch'

export const listBackups = () => panelFetch('/api/backups')
export const createBackup = (name) => panelFetch('/api/backups', { method: 'POST', body: JSON.stringify({ name }) })
export const getBackupDownloadUrl = (id) => panelFetch(`/api/backups/${id}/download-url`)
export const deleteBackup = (id) => panelFetch(`/api/backups/${id}`, { method: 'DELETE' })
export const restoreBackup = (id) => panelFetch(`/api/backups/${id}/restore`, { method: 'POST' })
export const toggleBackupLock = (id) => panelFetch(`/api/backups/${id}/lock`, { method: 'POST' })
