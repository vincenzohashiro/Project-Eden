import { useCallback, useEffect, useState } from 'react'
import { getStartupVariables, updateStartupVariable } from '../lib/mcStartup'

function EdenStartupPanel() {
  const [variables, setVariables] = useState(null)
  const [error, setError] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [pendingKey, setPendingKey] = useState(null)

  const refresh = useCallback(() => {
    getStartupVariables()
      .then((data) => setVariables(data?.variables ?? []))
      .catch(() => setError('Failed to load startup variables.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleSave = async (envVariable) => {
    setPendingKey(envVariable)
    try {
      await updateStartupVariable(envVariable, drafts[envVariable])
      refresh()
    } catch {
      setError('Failed to update variable.')
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Startup Variables</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {variables === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Value</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {variables.map((v) => (
                <tr key={v.envVariable}>
                  <td>{v.name}</td>
                  <td>{v.description}</td>
                  <td>
                    <input
                      type="text"
                      disabled={!v.isEditable}
                      value={drafts[v.envVariable] ?? v.serverValue}
                      onChange={(event) => setDrafts((prev) => ({ ...prev, [v.envVariable]: event.target.value }))}
                    />
                  </td>
                  <td>
                    {v.isEditable && (
                      <button
                        type="button"
                        className="eden-btn"
                        disabled={pendingKey === v.envVariable}
                        onClick={() => handleSave(v.envVariable)}
                      >
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default EdenStartupPanel
