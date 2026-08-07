import { useCallback, useEffect, useState } from 'react'
import { createDatabase, deleteDatabase, listDatabases, rotatePassword } from '../lib/mcDatabases'

function EdenDatabasesPanel() {
  const [databases, setDatabases] = useState(null)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [pendingId, setPendingId] = useState(null)
  const [revealed, setRevealed] = useState({})

  const refresh = useCallback(() => {
    listDatabases()
      .then((data) => setDatabases(data?.databases ?? []))
      .catch(() => setError('Failed to load databases.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    try {
      await createDatabase(name.trim(), '%')
      setName('')
      refresh()
    } catch {
      setError('Failed to create database.')
    }
  }

  const handleRotate = async (id) => {
    setPendingId(id)
    try {
      const updated = await rotatePassword(id)
      setDatabases((prev) => prev.map((db) => (db.id === id ? updated : db)))
      setRevealed((prev) => ({ ...prev, [id]: true }))
    } catch {
      setError('Failed to rotate password.')
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id) => {
    setPendingId(id)
    try {
      await deleteDatabase(id)
      refresh()
    } catch {
      setError('Failed to delete database.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Databases</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {databases === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : databases.length === 0 ? (
        <p className="eden-empty-state">No databases yet.</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Host</th>
                <th>Username</th>
                <th>Password</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {databases.map((db) => (
                <tr key={db.id}>
                  <td>{db.name}</td>
                  <td>{db.host.address}:{db.host.port}</td>
                  <td>{db.username}</td>
                  <td>{revealed[db.id] && db.password ? db.password : '••••••••'}</td>
                  <td>
                    <div className="eden-table-actions">
                      <button type="button" disabled={pendingId === db.id} onClick={() => handleRotate(db.id)}>
                        Rotate
                      </button>
                      <button type="button" className="danger" disabled={pendingId === db.id} onClick={() => handleDelete(db.id)}>
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
          placeholder="Database name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="eden-btn eden-btn-primary">
          Create Database
        </button>
      </form>
    </section>
  )
}

export default EdenDatabasesPanel
