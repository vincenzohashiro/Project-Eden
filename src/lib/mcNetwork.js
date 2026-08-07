import { panelFetch } from './panelFetch'

export const listAllocations = () => panelFetch('/api/network')
export const assignAllocation = () => panelFetch('/api/network', { method: 'POST' })
export const setPrimaryAllocation = (id) => panelFetch(`/api/network/${id}/primary`, { method: 'POST' })
export const updateAllocationNotes = (id, notes) =>
  panelFetch(`/api/network/${id}`, { method: 'PATCH', body: JSON.stringify({ notes }) })
export const removeAllocation = (id) => panelFetch(`/api/network/${id}`, { method: 'DELETE' })
