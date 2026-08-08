import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EdenBackupsPanel from '../components/EdenBackupsPanel'
import EdenConsolePanel from '../components/EdenConsolePanel'
import EdenDatabasesPanel from '../components/EdenDatabasesPanel'
import EdenFilesPanel from '../components/EdenFilesPanel'
import EdenNetworkPanel from '../components/EdenNetworkPanel'
import EdenOverviewPanel from '../components/EdenOverviewPanel'
import EdenPlayersPanel from '../components/EdenPlayersPanel'
import EdenSchedulesPanel from '../components/EdenSchedulesPanel'
import EdenSettingsPanel from '../components/EdenSettingsPanel'
import EdenSidebar from '../components/EdenSidebar'
import EdenStartupPanel from '../components/EdenStartupPanel'
import EdenStatCard from '../components/EdenStatCard'
import EdenSubusersPanel from '../components/EdenSubusersPanel'
import { useAuth } from '../context/AuthContext'
import { formatBytes } from '../lib/formatBytes'
import { useConsoleSocket } from '../hooks/useConsoleSocket'
import {
  getServerStats,
  getServerStatus,
  killServer,
  restartServer,
  startServer,
  stopServer,
} from '../lib/mcPanel'
import './EdenEnginePage.css'

const STATS_HISTORY_LIMIT = 30

// Pterodactyl's CPU limit is a percentage of one core (100 = 1 core, 0 =
// unlimited) — not the CPU's brand/model, which the Client API doesn't expose.
function formatCpuLimit(cpuLimitPercent) {
  if (!cpuLimitPercent) return 'Unlimited'
  const cores = cpuLimitPercent / 100
  return `of ${cores} core${cores === 1 ? '' : 's'}`
}

function cpuPercentOfLimit(stats) {
  if (!stats.cpuLimitPercent) return stats.cpuPercent
  return (stats.cpuPercent / stats.cpuLimitPercent) * 100
}

function EdenEnginePage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [statsHistory, setStatsHistory] = useState([])
  const [pending, setPending] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [activeTab, setActiveTab] = useState('console')

  const isAdmin = profile?.role === 'admin'
  const consoleSocket = useConsoleSocket({ enabled: isAdmin })

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  const refreshStatus = useCallback(() => {
    getServerStatus().then((data) => data && setStatus(data))
  }, [])

  const refreshStats = useCallback(() => {
    getServerStats().then((data) => {
      if (!data) return
      setStats(data)
      setStatsHistory((prev) => {
        const next = [...prev, data]
        return next.length > STATS_HISTORY_LIMIT ? next.slice(next.length - STATS_HISTORY_LIMIT) : next
      })
    })
  }, [])

  useEffect(() => {
    if (!isAdmin) return undefined
    refreshStatus()
    refreshStats()
    const statusId = setInterval(refreshStatus, 10000)
    const statsId = setInterval(refreshStats, 5000)
    return () => {
      clearInterval(statusId)
      clearInterval(statsId)
    }
  }, [isAdmin, refreshStatus, refreshStats])

  if (loading || !user) {
    return (
      <div className="engine-page engine-loading">
        <span className="eyebrow">LOADING SESSION</span>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="engine-page">
        <div className="engine-card">
          <span className="hero-corner tl" aria-hidden="true" />
          <span className="hero-corner br" aria-hidden="true" />
          <span className="eyebrow">EDEN ENGINE</span>
          <h1 className="engine-title">ACCESS RESTRICTED</h1>
          <p className="tagline">This control panel is limited to server operators.</p>
        </div>
      </div>
    )
  }

  const handleAction = async (action, run) => {
    setPending(action)
    setActionError(null)
    try {
      const result = await run()
      if (result?.state) setStatus((prev) => ({ ...prev, state: result.state }))
    } catch (err) {
      setActionError(err.status === 409 ? 'Already in that state.' : 'Action failed — try again.')
    } finally {
      setPending(null)
      refreshStatus()
    }
  }

  return (
    <div className="eden-dashboard">
      <EdenSidebar
        status={status}
        stats={stats}
        pending={pending}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onStart={() => handleAction('start', startServer)}
        onStop={() => handleAction('stop', stopServer)}
        onRestart={() => handleAction('restart', restartServer)}
        onKill={() => handleAction('kill', killServer)}
      />
      <div className="eden-main">
        {actionError && <p className="engine-error">{actionError}</p>}

        {activeTab === 'console' && (
          <>
            <div className="eden-stats-row">
              <EdenStatCard
                label="CPU"
                value={stats ? `${stats.cpuPercent.toFixed(0)}%` : '—'}
                subValue={stats ? formatCpuLimit(stats.cpuLimitPercent) : null}
                percent={stats ? cpuPercentOfLimit(stats) : null}
              />
              <EdenStatCard
                label="Memory"
                value={stats ? formatBytes(stats.memory.usedBytes) : '—'}
                subValue={stats ? `of ${formatBytes(stats.memory.totalBytes)}` : null}
                percent={stats ? (stats.memory.usedBytes / stats.memory.totalBytes) * 100 : null}
              />
              <EdenStatCard
                label="Disk"
                value={stats ? formatBytes(stats.disk.usedBytes) : '—'}
                subValue={stats ? `of ${formatBytes(stats.disk.totalBytes)}` : null}
                percent={stats ? (stats.disk.usedBytes / stats.disk.totalBytes) * 100 : null}
              />
              <EdenStatCard
                label="Network"
                value={stats ? `↓ ${formatBytes(stats.network.rxBytesPerSec)}/s` : '—'}
                subValue={stats ? `↑ ${formatBytes(stats.network.txBytesPerSec)}/s` : null}
              />
            </div>

            <EdenConsolePanel status={status} consoleSocket={consoleSocket} />
          </>
        )}

        {activeTab === 'overview' && <EdenOverviewPanel status={status} stats={stats} />}

        {activeTab === 'stats' && (
          <div className="eden-stats-tab">
            <EdenStatCard
              large
              label="CPU"
              value={stats ? `${stats.cpuPercent.toFixed(0)}%` : '—'}
              subValue={stats ? formatCpuLimit(stats.cpuLimitPercent) : null}
              percent={stats ? cpuPercentOfLimit(stats) : null}
              history={statsHistory.map((s) => s.cpuPercent)}
            />
            <EdenStatCard
              large
              label="Memory"
              value={stats ? formatBytes(stats.memory.usedBytes) : '—'}
              subValue={stats ? `of ${formatBytes(stats.memory.totalBytes)}` : null}
              percent={stats ? (stats.memory.usedBytes / stats.memory.totalBytes) * 100 : null}
              history={statsHistory.map((s) => s.memory.usedBytes)}
            />
            <EdenStatCard
              large
              label="Disk"
              value={stats ? formatBytes(stats.disk.usedBytes) : '—'}
              subValue={stats ? `of ${formatBytes(stats.disk.totalBytes)}` : null}
              percent={stats ? (stats.disk.usedBytes / stats.disk.totalBytes) * 100 : null}
            />
            <EdenStatCard
              large
              label="Network"
              value={stats ? `↓ ${formatBytes(stats.network.rxBytesPerSec)}/s` : '—'}
              subValue={stats ? `↑ ${formatBytes(stats.network.txBytesPerSec)}/s` : null}
              history={statsHistory.map((s) => s.network.rxBytesPerSec)}
            />
          </div>
        )}

        {activeTab === 'players' && <EdenPlayersPanel />}
        {activeTab === 'databases' && <EdenDatabasesPanel />}
        {activeTab === 'schedules' && <EdenSchedulesPanel />}
        {activeTab === 'backups' && <EdenBackupsPanel />}
        {activeTab === 'network' && <EdenNetworkPanel />}
        {activeTab === 'startup' && <EdenStartupPanel />}
        {activeTab === 'subusers' && <EdenSubusersPanel />}
        {activeTab === 'settings' && <EdenSettingsPanel />}
        {activeTab === 'files' && <EdenFilesPanel />}
      </div>
    </div>
  )
}

export default EdenEnginePage
