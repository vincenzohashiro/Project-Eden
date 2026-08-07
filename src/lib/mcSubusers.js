import { panelFetch } from './panelFetch'

export const listSubusers = () => panelFetch('/api/subusers')
export const createSubuser = (email, permissions) =>
  panelFetch('/api/subusers', { method: 'POST', body: JSON.stringify({ email, permissions }) })
export const updateSubuserPermissions = (uuid, permissions) =>
  panelFetch(`/api/subusers/${uuid}`, { method: 'PATCH', body: JSON.stringify({ permissions }) })
export const removeSubuser = (uuid) => panelFetch(`/api/subusers/${uuid}`, { method: 'DELETE' })
