import { panelFetch } from './panelFetch'

export const getStartupVariables = () => panelFetch('/api/startup')
export const updateStartupVariable = (key, value) =>
  panelFetch('/api/startup/variable', { method: 'PUT', body: JSON.stringify({ key, value }) })
