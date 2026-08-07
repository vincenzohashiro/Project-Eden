import { useCallback, useEffect, useState } from 'react'
import { formatBytes } from '../lib/formatBytes'
import {
  createFolder,
  deleteFiles,
  getDownloadUrl,
  getUploadUrl,
  listFiles,
  readFile,
  renameFile,
  writeFile,
} from '../lib/mcFiles'

const TEXT_EXTENSIONS = ['.txt', '.properties', '.yml', '.yaml', '.json', '.log', '.toml', '.conf', '.cfg', '.env']

function isTextLike(entry) {
  if (entry.mimetype?.startsWith('text/')) return true
  return TEXT_EXTENSIONS.some((ext) => entry.name.toLowerCase().endsWith(ext))
}

function joinPath(dir, name) {
  return dir === '/' ? `/${name}` : `${dir}/${name}`
}

function EdenFilesPanel() {
  const [currentDir, setCurrentDir] = useState('/')
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)
  const [editingFile, setEditingFile] = useState(null) // { path, content }
  const [saving, setSaving] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [pendingName, setPendingName] = useState(null)

  const refresh = useCallback((dir) => {
    listFiles(dir)
      .then((data) => setEntries(data?.files ?? []))
      .catch(() => setError('Failed to load directory.'))
  }, [])

  useEffect(() => {
    setEntries(null)
    refresh(currentDir)
  }, [currentDir, refresh])

  const breadcrumbParts = currentDir === '/' ? [] : currentDir.split('/').filter(Boolean)

  const handleOpen = async (entry) => {
    const path = joinPath(currentDir, entry.name)
    if (!entry.isFile) {
      setCurrentDir(path)
      return
    }
    if (!isTextLike(entry)) {
      setError(`${entry.name} isn't a text file — download it instead.`)
      return
    }
    try {
      const content = await readFile(path)
      setEditingFile({ path, content: content ?? '' })
    } catch {
      setError('Failed to read file.')
    }
  }

  const handleSave = async () => {
    if (!editingFile) return
    setSaving(true)
    try {
      await writeFile(editingFile.path, editingFile.content)
      setEditingFile(null)
      refresh(currentDir)
    } catch {
      setError('Failed to save file.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFolder = async (event) => {
    event.preventDefault()
    if (!newFolderName.trim()) return
    try {
      await createFolder(currentDir, newFolderName.trim())
      setNewFolderName('')
      refresh(currentDir)
    } catch {
      setError('Failed to create folder.')
    }
  }

  const handleRename = async (entry) => {
    const newName = window.prompt('Rename to:', entry.name)
    if (!newName || newName === entry.name) return
    setPendingName(entry.name)
    try {
      await renameFile(currentDir, entry.name, newName)
      refresh(currentDir)
    } catch {
      setError('Failed to rename.')
    } finally {
      setPendingName(null)
    }
  }

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete ${entry.name}?`)) return
    setPendingName(entry.name)
    try {
      await deleteFiles(currentDir, [entry.name])
      refresh(currentDir)
    } catch {
      setError('Failed to delete.')
    } finally {
      setPendingName(null)
    }
  }

  const handleDownload = async (entry) => {
    try {
      const data = await getDownloadUrl(joinPath(currentDir, entry.name))
      if (data?.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Failed to get download link.')
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const data = await getUploadUrl(currentDir)
      const formData = new FormData()
      formData.append('files', file)
      await fetch(data.url, { method: 'POST', body: formData })
      refresh(currentDir)
    } catch {
      setError('Failed to upload.')
    }
  }

  if (editingFile) {
    return (
      <section className="eden-panel">
        <div className="eden-panel-header">
          <h2>{editingFile.path}</h2>
          <div className="eden-table-actions">
            <button type="button" className="eden-btn" onClick={() => setEditingFile(null)}>
              Cancel
            </button>
            <button type="button" className="eden-btn eden-btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
        <div className="eden-file-editor">
          <textarea
            value={editingFile.content}
            onChange={(event) => setEditingFile((prev) => ({ ...prev, content: event.target.value }))}
            spellCheck={false}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="eden-panel">
      <div className="eden-panel-header">
        <h2>Files</h2>
        <div className="eden-table-actions">
          <label className="eden-btn">
            Upload
            <input type="file" hidden onChange={handleUpload} />
          </label>
          <button type="button" className="eden-btn" onClick={() => refresh(currentDir)}>
            Refresh
          </button>
        </div>
      </div>

      <div className="eden-files-breadcrumb">
        <button type="button" onClick={() => setCurrentDir('/')}>
          home
        </button>
        {breadcrumbParts.map((part, index) => (
          <span key={part}>
            {' / '}
            <button type="button" onClick={() => setCurrentDir(`/${breadcrumbParts.slice(0, index + 1).join('/')}`)}>
              {part}
            </button>
          </span>
        ))}
      </div>

      {error && <p className="eden-inline-error">{error}</p>}

      {entries === null ? (
        <p className="eden-empty-state">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="eden-empty-state">This folder is empty.</p>
      ) : (
        <div className="eden-table-wrap">
          <table className="eden-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Modified</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.name}>
                  <td>
                    <button type="button" className="eden-files-name-btn" onClick={() => handleOpen(entry)}>
                      {entry.isFile ? '' : '📁 '}
                      {entry.name}
                    </button>
                  </td>
                  <td>{entry.isFile ? formatBytes(entry.size) : '—'}</td>
                  <td>{new Date(entry.modifiedAt).toLocaleString()}</td>
                  <td>
                    <div className="eden-table-actions">
                      {entry.isFile && (
                        <button type="button" onClick={() => handleDownload(entry)}>
                          Download
                        </button>
                      )}
                      <button type="button" disabled={pendingName === entry.name} onClick={() => handleRename(entry)}>
                        Rename
                      </button>
                      <button type="button" className="danger" disabled={pendingName === entry.name} onClick={() => handleDelete(entry)}>
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

      <form className="eden-form-row" onSubmit={handleCreateFolder}>
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(event) => setNewFolderName(event.target.value)}
        />
        <button type="submit" className="eden-btn">
          Create Folder
        </button>
      </form>
    </section>
  )
}

export default EdenFilesPanel
