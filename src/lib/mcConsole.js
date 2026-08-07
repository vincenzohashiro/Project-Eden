const PANEL_API_URL = import.meta.env.VITE_MC_PANEL_URL

export function buildConsoleWsUrl(ticket) {
  if (!PANEL_API_URL) return null
  return `${PANEL_API_URL.replace(/^http/, 'ws')}/api/console/ws?ticket=${encodeURIComponent(ticket)}`
}
