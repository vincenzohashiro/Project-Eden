import { useCallback, useEffect, useState } from 'react'
import { createSchedule, createTask, deleteSchedule, deleteTask, executeSchedule, listSchedules } from '../lib/mcSchedules'

const EMPTY_FORM = { name: '', minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*', isActive: true }

function cronSummary(cron) {
  return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`
}

function EdenSchedulesPanel() {
  const [schedules, setSchedules] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [pendingId, setPendingId] = useState(null)
  const [taskDrafts, setTaskDrafts] = useState({})

  const refresh = useCallback(() => {
    listSchedules()
      .then((data) => setSchedules(data?.schedules ?? []))
      .catch(() => setError('Failed to load schedules.'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    setError(null)
    try {
      await createSchedule(form)
      setForm(EMPTY_FORM)
      refresh()
    } catch {
      setError('Failed to create schedule.')
    }
  }

  const handleExecute = async (id) => {
    setPendingId(id)
    try {
      await executeSchedule(id)
      refresh()
    } catch {
      setError('Failed to execute schedule.')
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id) => {
    setPendingId(id)
    try {
      await deleteSchedule(id)
      refresh()
    } catch {
      setError('Failed to delete schedule.')
    } finally {
      setPendingId(null)
    }
  }

  const handleAddTask = async (scheduleId) => {
    const draft = taskDrafts[scheduleId] ?? { action: 'command', payload: '' }
    setPendingId(scheduleId)
    try {
      await createTask(scheduleId, draft.action, draft.payload, 0)
      setTaskDrafts((prev) => ({ ...prev, [scheduleId]: { action: 'command', payload: '' } }))
      refresh()
    } catch {
      setError('Failed to add task.')
    } finally {
      setPendingId(null)
    }
  }

  const handleDeleteTask = async (scheduleId, taskId) => {
    setPendingId(scheduleId)
    try {
      await deleteTask(scheduleId, taskId)
      refresh()
    } catch {
      setError('Failed to delete task.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Schedules</h2>
        <button type="button" className="eden-btn" onClick={refresh}>
          Refresh
        </button>
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {schedules === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : schedules.length === 0 ? (
        <p className="eden-empty-state">No schedules yet.</p>
      ) : (
        schedules.map((s) => (
          <div key={s.id} className="eden-subuser-row">
            <div className="eden-panel-header">
              <span>
                {s.name} <span className="eden-text-dim">({cronSummary(s.cron)})</span>
                {!s.isActive && <span className="eden-text-dim"> — inactive</span>}
              </span>
              <div className="eden-table-actions">
                <button type="button" disabled={pendingId === s.id} onClick={() => handleExecute(s.id)}>
                  Run Now
                </button>
                <button type="button" className="danger" disabled={pendingId === s.id} onClick={() => handleDelete(s.id)}>
                  Delete
                </button>
              </div>
            </div>

            {s.tasks.length > 0 && (
              <ul>
                {s.tasks.map((t) => (
                  <li key={t.id} className="eden-form-row">
                    <span>
                      {t.action}: {t.payload || '—'}
                    </span>
                    <button type="button" className="danger" onClick={() => handleDeleteTask(s.id, t.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="eden-form-row">
              <select
                value={taskDrafts[s.id]?.action ?? 'command'}
                onChange={(event) =>
                  setTaskDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? {}), action: event.target.value } }))
                }
              >
                <option value="command">command</option>
                <option value="power">power</option>
                <option value="backup">backup</option>
              </select>
              <input
                type="text"
                placeholder="Payload"
                value={taskDrafts[s.id]?.payload ?? ''}
                onChange={(event) =>
                  setTaskDrafts((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] ?? {}), payload: event.target.value } }))
                }
              />
              <button type="button" className="eden-btn" onClick={() => handleAddTask(s.id)}>
                Add Task
              </button>
            </div>
          </div>
        ))
      )}

      <form className="eden-form-row is-stacked" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Schedule name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <div className="eden-form-row">
          {['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field}
              value={form[field]}
              onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
            />
          ))}
          <label className="eden-permission-label">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Active
          </label>
        </div>
        <button type="submit" className="eden-btn eden-btn-primary">
          Create Schedule
        </button>
      </form>
    </section>
  )
}

export default EdenSchedulesPanel
