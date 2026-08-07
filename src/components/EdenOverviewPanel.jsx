import { formatBytes } from '../lib/formatBytes'

const STATE_LABELS = {
  running: 'ONLINE',
  stopped: 'OFFLINE',
  starting: 'STARTING…',
  stopping: 'STOPPING…',
  unknown: 'UNKNOWN',
}

function formatUptime(lastChangedAt) {
  if (!lastChangedAt) return '—'
  const ms = Date.now() - new Date(lastChangedAt).getTime()
  if (ms < 0) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function EdenOverviewPanel({ status, stats }) {
  const state = status?.state ?? 'unknown'
  const players = stats?.players

  return (
    <section className="eden-overview">
      <div className="eden-overview-row">
        <span>Status</span>
        <span>{STATE_LABELS[state] ?? state.toUpperCase()}</span>
      </div>
      <div className="eden-overview-row">
        <span>Software</span>
        <span>Minecraft · Paper</span>
      </div>
      <div className="eden-overview-row">
        <span>Address</span>
        <span>play.projecteden.net</span>
      </div>
      <div className="eden-overview-row">
        <span>Uptime</span>
        <span>{state === 'running' ? formatUptime(status.lastChangedAt) : '—'}</span>
      </div>
      <div className="eden-overview-row">
        <span>CPU / Memory</span>
        <span>{stats ? `${stats.cpuPercent.toFixed(0)}% · ${formatBytes(stats.memory.usedBytes)}` : '—'}</span>
      </div>
      <div className="eden-overview-row">
        <span>Players ({players ? `${players.online}/${players.max}` : '—'})</span>
        <span />
      </div>
      {players?.names?.length ? (
        <div className="eden-overview-players">
          {players.names.map((name) => (
            <span key={name} className="eden-overview-player-chip">
              {name}
            </span>
          ))}
        </div>
      ) : (
        <p className="eden-overview-empty">No players online.</p>
      )}
    </section>
  )
}

export default EdenOverviewPanel
