import { useMemo, useRef, useState } from 'react'

const ERROR_RE = /ERROR|SEVERE|WARN/i

function formatUptime(lastChangedAt) {
  if (!lastChangedAt) return '—'
  const ms = Date.now() - new Date(lastChangedAt).getTime()
  if (ms < 0) return '—'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

const CONN_LABELS = {
  idle: 'IDLE',
  connecting: 'CONNECTING…',
  open: 'LIVE',
  closed: 'DISCONNECTED',
  error: 'CONNECTION ERROR',
}

function EdenConsolePanel({ status, consoleSocket }) {
  const { lines, connState, reconnect, sendCommand, clear } = consoleSocket
  const [filter, setFilter] = useState('all')
  const [command, setCommand] = useState('')
  const logRef = useRef(null)

  const visibleLines = useMemo(() => {
    if (filter !== 'errors') return lines
    return lines.filter((line) => line.kind === 'error' || ERROR_RE.test(line.text))
  }, [lines, filter])

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = command.trim()
    if (!trimmed) return
    sendCommand(trimmed)
    setCommand('')
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(visibleLines.map((line) => line.text).join('\n'))
  }

  const handleDownload = () => {
    const blob = new Blob([visibleLines.map((line) => line.text).join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'console.log'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="eden-console-panel">
      <div className="eden-console-topbar">
        <span className={`eden-conn-badge is-${connState}`}>{CONN_LABELS[connState] ?? connState}</span>
        <button type="button" className="btn btn-ghost" onClick={reconnect}>
          Reconnect
        </button>
        <span className="eden-uptime">Uptime {status?.state === 'running' ? formatUptime(status.lastChangedAt) : '—'}</span>
      </div>

      <div className="eden-console-toolbar">
        <div className="eden-console-filter">
          <button
            type="button"
            className={filter === 'all' ? 'is-active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={filter === 'errors' ? 'is-active' : ''}
            onClick={() => setFilter('errors')}
          >
            Errors
          </button>
        </div>
        <div className="eden-console-actions">
          <button type="button" onClick={clear}>Clear</button>
          <button type="button" onClick={handleCopy}>Copy</button>
          <button type="button" onClick={handleDownload}>Download</button>
        </div>
      </div>

      <div className="eden-console-log" ref={logRef}>
        {visibleLines.length === 0 && <div className="eden-console-empty">No console output yet.</div>}
        {visibleLines.map((line) => (
          <div key={line.id} className={`eden-console-line eden-console-line-${line.kind}`}>
            {line.text}
          </div>
        ))}
      </div>

      <form className="eden-console-input" onSubmit={handleSubmit}>
        <span className="eden-console-prompt">&gt;</span>
        <input
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="Type a server command…"
          disabled={connState !== 'open'}
        />
        <button type="submit" className="btn btn-ghost" disabled={connState !== 'open' || !command.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}

export default EdenConsolePanel
