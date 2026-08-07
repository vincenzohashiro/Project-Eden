import { useCallback, useEffect, useState } from 'react'
import { createSubuser, listSubusers, removeSubuser, updateSubuserPermissions } from '../lib/mcSubusers'

const PERMISSION_OPTIONS = [
  'control.console',
  'control.start',
  'control.stop',
  'control.restart',
  'file.read',
  'file.update',
  'file.delete',
  'backup.read',
  'backup.create',
  'database.read',
  'database.create',
]

function EdenSubusersPanel() {
  const [subusers, setSubusers] = useState(null)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [newPermissions, setNewPermissions] = useState([])
  const [pendingUuid, setPendingUuid] = useState(null)

  const refresh = useCallback(() => {
    listSubusers()
      .then((data) => setSubusers(data?.subusers ?? []))
      .catch(() => setError('Failed to load subusers.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const togglePermission = (perm) => {
    setNewPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!email.trim() || newPermissions.length === 0) return
    setError(null)
    try {
      await createSubuser(email.trim(), newPermissions)
      setEmail('')
      setNewPermissions([])
      refresh()
    } catch {
      setError('Failed to invite subuser.')
    }
  }

  const handleTogglePermission = async (subuser, perm) => {
    setPendingUuid(subuser.uuid)
    const next = subuser.permissions.includes(perm)
      ? subuser.permissions.filter((p) => p !== perm)
      : [...subuser.permissions, perm]
    try {
      await updateSubuserPermissions(subuser.uuid, next)
      refresh()
    } catch {
      setError('Failed to update permissions.')
    } finally {
      setPendingUuid(null)
    }
  }

  const handleRemove = async (uuid) => {
    setPendingUuid(uuid)
    try {
      await removeSubuser(uuid)
      refresh()
    } catch {
      setError('Failed to remove subuser.')
    } finally {
      setPendingUuid(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Subusers</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {subusers === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : subusers.length === 0 ? (
        <p className="eden-empty-state">No subusers yet.</p>
      ) : (
        subusers.map((u) => (
          <div key={u.uuid} className="eden-subuser-row">
            <div className="eden-panel-header">
              <span>
                {u.username} <span className="eden-text-dim">({u.email})</span>
              </span>
              <button type="button" className="danger" disabled={pendingUuid === u.uuid} onClick={() => handleRemove(u.uuid)}>
                Remove
              </button>
            </div>
            <div className="eden-form-row">
              {PERMISSION_OPTIONS.map((perm) => (
                <label key={perm} className="eden-permission-label">
                  <input
                    type="checkbox"
                    checked={u.permissions.includes(perm)}
                    disabled={pendingUuid === u.uuid}
                    onChange={() => handleTogglePermission(u, perm)}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>
        ))
      )}

      <form className="eden-form-row is-stacked" onSubmit={handleCreate}>
        <input type="email" placeholder="Email to invite" value={email} onChange={(event) => setEmail(event.target.value)} />
        <div className="eden-form-row">
          {PERMISSION_OPTIONS.map((perm) => (
            <label key={perm} className="eden-permission-label">
              <input type="checkbox" checked={newPermissions.includes(perm)} onChange={() => togglePermission(perm)} />
              {perm}
            </label>
          ))}
        </div>
        <button type="submit" className="eden-btn eden-btn-primary">
          Invite Subuser
        </button>
      </form>
    </section>
  )
}

export default EdenSubusersPanel
