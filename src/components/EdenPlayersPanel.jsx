import { useCallback, useEffect, useState } from 'react'
import {
  banPlayer,
  deopPlayer,
  getPlayers,
  getWhitelist,
  kickPlayer,
  opPlayer,
  whitelistAdd,
  whitelistRemove,
} from '../lib/mcPlayers'

function EdenPlayersPanel() {
  const [players, setPlayers] = useState(null)
  const [whitelist, setWhitelist] = useState(null)
  const [error, setError] = useState(null)
  const [pendingName, setPendingName] = useState(null)
  const [newWhitelistName, setNewWhitelistName] = useState('')

  const refresh = useCallback(() => {
    getPlayers()
      .then((data) => setPlayers(data?.players ?? null))
      .catch(() => setError('Failed to load online players.'))
    getWhitelist()
      .then((data) => setWhitelist(data?.names ?? []))
      .catch(() => setError('Failed to load whitelist.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const runAction = async (name, action) => {
    setPendingName(name)
    setError(null)
    try {
      await action(name)
      refresh()
    } catch {
      setError(`Action failed for ${name} — server may be offline or RCON unreachable.`)
    } finally {
      setPendingName(null)
    }
  }

  const handleWhitelistAdd = async (event) => {
    event.preventDefault()
    if (!newWhitelistName.trim()) return
    const name = newWhitelistName.trim()
    setPendingName(name)
    setError(null)
    try {
      await whitelistAdd(name)
      setNewWhitelistName('')
      refresh()
    } catch {
      setError('Failed to add to whitelist.')
    } finally {
      setPendingName(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Players</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      <h3 className="eden-panel-subheading">
        Online {players ? `(${players.online}/${players.max})` : ''}
      </h3>
      {players === null ? (
        <p className="eden-empty-state">Server offline or RCON unreachable.</p>
      ) : players.names.length === 0 ? (
        <p className="eden-empty-state">No players online.</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Name</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {players.names.map((name) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    <div className="eden-table-actions">
                      <button type="button" disabled={pendingName === name} onClick={() => runAction(name, opPlayer)}>
                        Op
                      </button>
                      <button type="button" disabled={pendingName === name} onClick={() => runAction(name, deopPlayer)}>
                        De-op
                      </button>
                      <button type="button" disabled={pendingName === name} onClick={() => runAction(name, kickPlayer)}>
                        Kick
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={pendingName === name}
                        onClick={() => runAction(name, banPlayer)}
                      >
                        Ban
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="eden-panel-subheading">Whitelist</h3>
      {whitelist === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : whitelist.length === 0 ? (
        <p className="eden-empty-state">Whitelist is empty.</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Name</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {whitelist.map((name) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    <div className="eden-table-actions">
                      <button
                        type="button"
                        className="danger"
                        disabled={pendingName === name}
                        onClick={() => runAction(name, whitelistRemove)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="eden-form-row" onSubmit={handleWhitelistAdd}>
        <input
          type="text"
          placeholder="Player name"
          value={newWhitelistName}
          onChange={(event) => setNewWhitelistName(event.target.value)}
        />
        <button type="submit" className="eden-btn eden-btn-primary">
          Add to Whitelist
        </button>
      </form>
    </section>
  )
}

export default EdenPlayersPanel
