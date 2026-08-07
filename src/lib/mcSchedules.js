import { panelFetch } from './panelFetch'

export const listSchedules = () => panelFetch('/api/schedules')
export const createSchedule = (input) => panelFetch('/api/schedules', { method: 'POST', body: JSON.stringify(input) })
export const updateSchedule = (id, input) =>
  panelFetch(`/api/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
export const deleteSchedule = (id) => panelFetch(`/api/schedules/${id}`, { method: 'DELETE' })
export const executeSchedule = (id) => panelFetch(`/api/schedules/${id}/execute`, { method: 'POST' })
export const createTask = (scheduleId, action, payload, timeOffset) =>
  panelFetch(`/api/schedules/${scheduleId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ action, payload, timeOffset }),
  })
export const deleteTask = (scheduleId, taskId) =>
  panelFetch(`/api/schedules/${scheduleId}/tasks/${taskId}`, { method: 'DELETE' })
