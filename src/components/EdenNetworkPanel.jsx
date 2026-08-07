import { useCallback, useEffect, useState } from 'react'
import { assignAllocation, listAllocations, removeAllocation, setPrimaryAllocation, updateAllocationNotes } from '../lib/mcNetwork'

function EdenNetworkPanel() {
  const [allocations, setAllocations] = useState(null)
  const [error, setError] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [notesDraft, setNotesDraft] = useState({})

  const refresh = useCallback(() => {
    listAllocations()
      .then((data) => setAllocations(data?.allocations ?? []))
      .catch(() => setError('Failed to load allocations.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleAssign = async () => {
    setAssigning(true)
    try {
      await assignAllocation()
      refresh()
    } catch {
      setError('Failed to assign allocation.')
    } finally {
      setAssigning(false)
    }
  }

  const handlePrimary = async (id) => {
    setPendingId(id)
    try {
      await setPrimaryAllocation(id)
      refresh()
    } catch {
      setError('Failed to set primary allocation.')
    } finally {
      setPendingId(null)
    }
  }

  const handleNotesSave = async (id) => {
    setPendingId(id)
    try {
      await updateAllocationNotes(id, notesDraft[id] ?? '')
      refresh()
    } catch {
      setError('Failed to update notes.')
    } finally {
      setPendingId(null)
    }
  }

  const handleRemove = async (id) => {
    setPendingId(id)
    try {
      await removeAllocation(id)
      refresh()
    } catch {
      setError('Failed to remove allocation.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Network</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {allocations === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : allocations.length === 0 ? (
        <p className="eden-empty-state">No allocations.</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Notes</th>
                <th>Primary</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.ipAlias || a.ip}:{a.port}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={notesDraft[a.id] ?? a.notes ?? ''}
                      onChange={(event) => setNotesDraft((prev) => ({ ...prev, [a.id]: event.target.value }))}
                      onBlur={() => handleNotesSave(a.id)}
                    />
                  </td>
                  <td>{a.isDefault ? 'Yes' : '—'}</td>
                  <td>
                    <div className="eden-table-actions">
                      {!a.isDefault && (
                        <button type="button" disabled={pendingId === a.id} onClick={() => handlePrimary(a.id)}>
                          Make Primary
                        </button>
                      )}
                      {!a.isDefault && (
                        <button type="button" className="danger" disabled={pendingId === a.id} onClick={() => handleRemove(a.id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="eden-form-row">
        <button type="button" className="eden-btn eden-btn-primary" disabled={assigning} onClick={handleAssign}>
          {assigning ? 'Assigning…' : 'Assign New Allocation'}
        </button>
      </div>
    </section>
  )
}

export default EdenNetworkPanel
