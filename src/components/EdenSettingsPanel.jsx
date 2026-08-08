import { useCallback, useEffect, useState } from 'react'
import { getServerSettings, reinstallServer, renameServer } from '../lib/mcSettings'

function EdenSettingsPanel() {
  const [settings, setSettings] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [reinstalling, setReinstalling] = useState(false)
  const [message, setMessage] = useState(null)

  const refresh = useCallback(() => {
    getServerSettings()
      .then((data) => {
        setSettings(data)
        setName(data?.name ?? '')
        setDescription(data?.description ?? '')
      })
      .catch(() => setError('Failed to load server settings.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await renameServer(name.trim(), description)
      setMessage('Saved.')
      refresh()
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleReinstall = async () => {
    if (!window.confirm('Reinstall this server? This reruns the egg install script and may wipe server files depending on the egg.')) return
    setReinstalling(true)
    setError(null)
    setMessage(null)
    try {
      await reinstallServer()
      setMessage('Reinstall started.')
    } catch {
      setError('Failed to start reinstall.')
    } finally {
      setReinstalling(false)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Settings</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}
      {message && <p className="eden-empty-state">{message}</p>}

      {settings === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : (
        <>
          <div className="eden-settings-grid">
            <div className="eden-settings-card">
              <h3>SFTP Details</h3>
              <div className="eden-settings-field">
                <label>Server Address</label>
                <div>{`sftp://${settings.sftpIp}:${settings.sftpPort}`}</div>
              </div>
              <div className="eden-settings-field">
                <label>Username</label>
                <div>{settings.sftpUsername}</div>
              </div>
              <p className="eden-text-dim">Your SFTP password is the same as the password you use to access this panel.</p>
              <a
                className="eden-btn"
                href={`sftp://${settings.sftpUsername}@${settings.sftpIp}:${settings.sftpPort}`}
              >
                Launch SFTP
              </a>
            </div>

            <form className="eden-settings-card eden-form-row is-stacked" onSubmit={handleSave}>
              <h3>Change Server Details</h3>
              <label htmlFor="eden-settings-name">Server name</label>
              <input
                id="eden-settings-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <label htmlFor="eden-settings-description">Description</label>
              <textarea
                id="eden-settings-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <button type="submit" className="eden-btn eden-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </form>
          </div>

          <h3 className="eden-panel-subheading">Danger Zone</h3>
          <div className="eden-danger-zone">
            <div>
              <strong>Reinstall server</strong>
              <p>Reruns the egg's install script against this server. Can be destructive — check the egg before running.</p>
            </div>
            <button type="button" className="eden-btn danger" disabled={reinstalling} onClick={handleReinstall}>
              {reinstalling ? 'Starting…' : 'Reinstall'}
            </button>
          </div>

          <h3 className="eden-panel-subheading">System Information</h3>
          <div className="eden-settings-grid">
            <div className="eden-settings-field">
              <label>Node</label>
              <div>{settings.node}</div>
            </div>
            <div className="eden-settings-field">
              <label>Server ID</label>
              <div>{settings.identifier}</div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default EdenSettingsPanel
