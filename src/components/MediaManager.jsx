import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ACCEPTED_TYPES,
  MEDIA_SECTIONS,
  deleteMedia,
  fetchMedia,
  reorderMedia,
  replaceMedia,
  subscribeToMedia,
  updateMedia,
  uploadMedia,
  validateImage,
} from '../lib/media'
import './MediaManager.css'

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)
const ICONS = {
  upload: 'M12 16V4m0 0-5 5m5-5 5 5M5 20h14',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2',
  swap: 'M4 8h13l-3-3M20 16H7l3 3',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
}

function MediaCard({ row, index, total, onMove, onDragStart, onDragEnter, onDragEnd, dragging, onError }) {
  const [alt, setAlt] = useState(row.alt)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const replaceInput = useRef(null)

  const run = async (fn) => {
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li
      className={`mm-card${row.visible ? '' : ' is-hidden'}${dragging ? ' is-dragging' : ''}${busy ? ' is-busy' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
    >
      <div className="mm-thumb">
        <img src={row.url} alt={row.alt || ''} loading="lazy" />
        <span className="mm-pos">{String(index + 1).padStart(2, '0')}</span>
        <span className="mm-grip" title="Drag to reorder" aria-hidden="true">
          <Icon d={ICONS.grip} />
        </span>
        {!row.visible && <span className="mm-hidden-tag">Hidden</span>}
      </div>

      <label className="mm-alt">
        <span>Description (for screen readers)</span>
        <input
          type="text"
          value={alt}
          maxLength={160}
          placeholder={`Featured model ${index + 1}`}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => alt !== row.alt && run(() => updateMedia(row.id, { alt: alt.trim() }))}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      </label>

      {confirming ? (
        <div className="mm-confirm">
          <span>Delete this image?</span>
          <button type="button" className="is-danger" onClick={() => run(() => deleteMedia(row))}>
            Delete
          </button>
          <button type="button" onClick={() => setConfirming(false)}>
            Keep
          </button>
        </div>
      ) : (
        <div className="mm-actions">
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move earlier" title="Move earlier">
            <Icon d={ICONS.left} />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label="Move later" title="Move later">
            <Icon d={ICONS.right} />
          </button>
          <button
            type="button"
            onClick={() => run(() => updateMedia(row.id, { visible: !row.visible }))}
            aria-label={row.visible ? 'Hide from site' : 'Show on site'}
            title={row.visible ? 'Hide from site' : 'Show on site'}
          >
            <Icon d={row.visible ? ICONS.eye : ICONS.eyeOff} />
          </button>
          <button type="button" onClick={() => replaceInput.current?.click()} aria-label="Replace image" title="Replace image">
            <Icon d={ICONS.swap} />
          </button>
          <button type="button" className="is-danger" onClick={() => setConfirming(true)} aria-label="Delete image" title="Delete image">
            <Icon d={ICONS.trash} />
          </button>
          <input
            ref={replaceInput}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) run(() => replaceMedia(row, file))
            }}
          />
        </div>
      )}
    </li>
  )
}

// Staff image library: upload, reorder, hide, replace and delete the images
// shown around the site (currently the Models page Featured gallery).
function MediaManager({ demo }) {
  const [section, setSection] = useState(MEDIA_SECTIONS[0].key)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(0)
  const [over, setOver] = useState(false)
  const [dragId, setDragId] = useState(null)
  const fileInput = useRef(null)

  const load = useCallback(async () => {
    try {
      setRows(await fetchMedia(section, { includeHidden: true }))
    } catch (err) {
      setError(err.message)
      setRows([])
    }
  }, [section])

  useEffect(() => {
    load()
    return subscribeToMedia(load)
  }, [load])

  const upload = async (files) => {
    const list = [...files]
    const bad = list.map(validateImage).find(Boolean)
    if (bad) setError(bad)
    const good = list.filter((f) => !validateImage(f))
    if (!good.length) return
    setUploading((n) => n + good.length)
    const start = rows?.length ?? 0
    await Promise.all(
      good.map((file, i) =>
        uploadMedia(section, file, start + i)
          .catch((err) => setError(err.message))
          .finally(() => setUploading((n) => n - 1)),
      ),
    )
    load()
  }

  const commitOrder = async (next) => {
    setRows(next)
    try {
      await reorderMedia(next)
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  const move = (index, d) => {
    const next = [...rows]
    const [item] = next.splice(index, 1)
    next.splice(index + d, 0, item)
    commitOrder(next)
  }

  // live preview while dragging; saved on drop
  const dragEnter = (targetId) => {
    if (!dragId || dragId === targetId) return
    setRows((list) => {
      const from = list.findIndex((r) => r.id === dragId)
      const to = list.findIndex((r) => r.id === targetId)
      const next = [...list]
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }

  const meta = MEDIA_SECTIONS.find((s) => s.key === section)
  const visible = rows?.filter((r) => r.visible).length ?? 0

  return (
    <section className="adm-card mm" aria-labelledby="mm-title">
      <header className="adm-card-head">
        <div>
          <h2 id="mm-title">Images</h2>
          <p className="mm-sub">
            {meta.where}. {rows ? `${visible} shown, ${rows.length - visible} hidden.` : ''}{' '}
            <Link to="/shop">View on site</Link>
          </p>
        </div>
        {MEDIA_SECTIONS.length > 1 && (
          <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Image section">
            {MEDIA_SECTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </header>

      {demo && <p className="adm-demo">Preview: uploads stay in this browser tab only and aren&apos;t saved.</p>}
      {error && (
        <p className="adm-error mm-error">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss">
            ×
          </button>
        </p>
      )}

      <button
        type="button"
        className={`mm-drop${over ? ' is-over' : ''}`}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return
          e.preventDefault()
          setOver(false)
          upload(e.dataTransfer.files)
        }}
      >
        <span className="mm-drop-icon">
          <Icon d={ICONS.upload} />
        </span>
        <strong>{uploading ? `Uploading ${uploading}…` : 'Drop images here or click to upload'}</strong>
        <span>PNG, JPG, WebP or GIF up to 10 MB. Select several at once.</span>
      </button>
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        hidden
        onChange={(e) => {
          upload(e.target.files)
          e.target.value = ''
        }}
      />

      {rows === null ? (
        <p className="adm-muted">Loading images…</p>
      ) : rows.length === 0 ? (
        <p className="adm-muted mm-empty">No images yet. The Featured section shows &quot;New models are on the way&quot; until you add some.</p>
      ) : (
        <ol className="mm-grid">
          {rows.map((row, i) => (
            <MediaCard
              key={row.id}
              row={row}
              index={i}
              total={rows.length}
              onMove={move}
              dragging={dragId === row.id}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                setDragId(row.id)
              }}
              onDragEnter={() => dragEnter(row.id)}
              onDragEnd={() => {
                if (dragId) commitOrder(rows)
                setDragId(null)
              }}
              onError={setError}
            />
          ))}
        </ol>
      )}
    </section>
  )
}

export default MediaManager
