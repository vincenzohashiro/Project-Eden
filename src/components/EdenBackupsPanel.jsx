import { useCallback, useEffect, useState } from 'react'
import { formatBytes } from '../lib/formatBytes'
import {
  createBackup,
  deleteBackup,
  getBackupDownloadUrl,
  listBackups,
  restoreBackup,
  toggleBackupLock,
} from '../lib/mcBackups'

function EdenBackupsPanel() {
  const [backups, setBackups] = useState(null)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [pendingId, setPendingId] = useState(null)

  const refresh = useCallback(() => {
    listBackups()
      .then((data) => setBackups(data?.backups ?? []))
      .catch(() => setError('Failed to load backups.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreate = async (event) => {
    event.preventDefault()
    setCreating(true)
    setError(null)
    try {
      await createBackup(name.trim() || undefined)
      setName('')
      refresh()
    } catch {
      setError('Failed to create backup.')
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = async (uuid) => {
    setPendingId(uuid)
    try {
      const data = await getBackupDownloadUrl(uuid)
      if (data?.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Failed to get download link.')
    } finally {
      setPendingId(null)
    }
  }

  const handleRestore = async (uuid) => {
    if (!window.confirm('Restore this backup? This will overwrite current server files.')) return
    setPendingId(uuid)
    try {
      await restoreBackup(uuid)
    } catch {
      setError('Failed to restore backup.')
    } finally {
      setPendingId(null)
    }
  }

  const handleLock = async (uuid) => {
    setPendingId(uuid)
    try {
      await toggleBackupLock(uuid)
      refresh()
    } catch {
      setError('Failed to toggle lock.')
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (uuid) => {
    setPendingId(uuid)
    try {
      await deleteBackup(uuid)
      refresh()
    } catch {
      setError('Failed to delete backup.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Backups</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {backups === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : backups.length === 0 ? (
        <p className="eden-empty-state">No backups yet.</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.uuid}>
                  <td>
                    {b.name} {b.isLocked && <span className="eden-text-dim">(locked)</span>}
                  </td>
                  <td>{formatBytes(b.bytes)}</td>
                  <td>{b.isSuccessful == null ? 'In progress…' : b.isSuccessful ? 'Complete' : 'Failed'}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="eden-table-actions">
                      <button type="button" disabled={pendingId === b.uuid} onClick={() => handleDownload(b.uuid)}>
                        Download
                      </button>
                      <button type="button" disabled={pendingId === b.uuid} onClick={() => handleRestore(b.uuid)}>
                        Restore
                      </button>
                      <button type="button" disabled={pendingId === b.uuid} onClick={() => handleLock(b.uuid)}>
                        {b.isLocked ? 'Unlock' : 'Lock'}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={pendingId === b.uuid || b.isLocked}
                        onClick={() => handleDelete(b.uuid)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="eden-form-row" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Backup name (optional)"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="eden-btn eden-btn-primary" disabled={creating}>
          {creating ? 'Creating…' : 'Create Backup'}
        </button>
      </form>
    </section>
  )
}

export default EdenBackupsPanel
