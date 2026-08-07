import { formatBytes } from '../lib/formatBytes'

const STATE_LABELS = {
  running: 'ONLINE',
  stopped: 'OFFLINE',
  starting: 'STARTING…',
  stopping: 'STOPPING…',
  unknown: 'UNKNOWN',
}

const GENERAL_TABS = [
  { id: 'console', label: 'Console' },
  { id: 'overview', label: 'Overview' },
  { id: 'stats', label: 'Stats' },
]

const SERVER_TABS = [
  { id: 'databases', label: 'Databases' },
  { id: 'schedules', label: 'Schedules' },
  { id: 'backups', label: 'Backups' },
  { id: 'network', label: 'Network' },
  { id: 'startup', label: 'Startup' },
  { id: 'subusers', label: 'Subusers' },
]

function EdenSidebar({ status, stats, pending, onStart, onStop, onRestart, onKill, activeTab, onSelectTab }) {
  const state = status?.state ?? 'unknown'
  const isRunning = state === 'running'
  const canStart = state === 'stopped' || state === 'unknown'
  const canStop = state === 'running'

  return (
    <aside className="eden-sidebar">
      <div className="eden-identity-card">
        <div className="eden-identity-row">
          <span className={`status-dot${isRunning ? '' : ' offline'}`} />
          <div>
            <div className="eden-identity-name">Project Eden</div>
            <div className="eden-identity-sub">Minecraft Server</div>
          </div>
        </div>
        <div className="eden-identity-state">{STATE_LABELS[state] ?? state.toUpperCase()}</div>

        <div className="eden-quick-stats">
          <div className="eden-quick-stat">
            <span>CPU</span>
            <strong>{stats ? `${stats.cpuPercent.toFixed(0)}%` : '—'}</strong>
          </div>
          <div className="eden-quick-stat">
            <span>RAM</span>
            <strong>{stats ? formatBytes(stats.memory.usedBytes) : '—'}</strong>
          </div>
          <div className="eden-quick-stat">
            <span>Disk</span>
            <strong>{stats ? formatBytes(stats.disk.usedBytes) : '—'}</strong>
          </div>
          <div className="eden-quick-stat">
            <span>Players</span>
            <strong>{stats?.players ? `${stats.players.online}/${stats.players.max}` : '—'}</strong>
          </div>
        </div>

        <div className="eden-power-row">
          <button type="button" disabled={pending !== null || !canStart} onClick={onStart} title="Start">
            Start
          </button>
          <button type="button" disabled={pending !== null} onClick={onRestart} title="Restart">
            Restart
          </button>
          <button type="button" disabled={pending !== null || !canStop} onClick={onStop} title="Stop">
            Stop
          </button>
          <button type="button" className="eden-btn-danger" disabled={pending !== null} onClick={onKill} title="Kill">
            Kill
          </button>
        </div>
      </div>

      <nav className="eden-nav">
        <div className="eden-nav-section">General</div>
        <ul>
          {GENERAL_TABS.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={`eden-nav-item${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="eden-nav-section">Server</div>
        <ul>
          {SERVER_TABS.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={`eden-nav-item${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="eden-nav-section">Files</div>
        <ul>
          <li>
            <button
              type="button"
              className={`eden-nav-item${activeTab === 'files' ? ' is-active' : ''}`}
              onClick={() => onSelectTab('files')}
            >
              Files
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default EdenSidebar
