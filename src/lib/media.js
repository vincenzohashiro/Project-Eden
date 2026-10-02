import { supabase } from './supabase'
import sampleSword from '../assets/zenith_sword_terarria.gif'
import sampleFrame from '../assets/PokeFrame.gif'

// Site images managed from /admin. Files live in the public `site-media`
// bucket, rows in site_media (supabase/migrations/20261002000000_site_media.sql).

const BUCKET = 'site-media'

export const MEDIA_SECTIONS = [{ key: 'featured', label: 'Featured models', where: 'Models page, Featured section' }]

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

// local dev without Supabase: an in-memory library so the panel and the
// Models page can be previewed together. Nothing is saved.
export const mediaDemo = !supabase && import.meta.env.DEV
let demoRows = mediaDemo
  ? [sampleSword, sampleFrame].map((url, i) => ({
      id: `demo-${i}`,
      section: 'featured',
      path: `demo-${i}`,
      url,
      alt: '',
      sort: i,
      visible: true,
      created_at: new Date().toISOString(),
    }))
  : []
const listeners = new Set()
const notify = () => listeners.forEach((fn) => fn())

const withUrl = (row) => ({
  ...row,
  url: row.url ?? supabase.storage.from(BUCKET).getPublicUrl(row.path).data.publicUrl,
})

export async function fetchMedia(section, { includeHidden = false } = {}) {
  if (!supabase) {
    return demoRows
      .filter((r) => r.section === section && (includeHidden || r.visible))
      .sort((a, b) => a.sort - b.sort)
  }
  let q = supabase.from('site_media').select('*').eq('section', section).order('sort').order('created_at')
  if (!includeHidden) q = q.eq('visible', true)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data.map(withUrl)
}

export function validateImage(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a PNG, JPG, WebP or GIF image.'
  if (file.size > MAX_UPLOAD_BYTES) return 'Images must be 10 MB or smaller.'
  return null
}

function objectPath(section, file) {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
  return `${section}/${crypto.randomUUID()}.${ext}`
}

export async function uploadMedia(section, file, sort) {
  const problem = validateImage(file)
  if (problem) throw new Error(problem)

  if (!supabase) {
    const id = crypto.randomUUID()
    demoRows.push({ id, section, path: id, url: URL.createObjectURL(file), alt: '', sort, visible: true, created_at: new Date().toISOString() })
    notify()
    return
  }

  const path = objectPath(section, file)
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (upErr) throw new Error(upErr.message)
  const { error } = await supabase.from('site_media').insert({ section, path, sort })
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(error.message)
  }
}

// swap the file behind an existing image, keeping its place and settings
export async function replaceMedia(row, file) {
  const problem = validateImage(file)
  if (problem) throw new Error(problem)

  if (!supabase) {
    demoRows = demoRows.map((r) => (r.id === row.id ? { ...r, url: URL.createObjectURL(file) } : r))
    notify()
    return
  }

  const path = objectPath(row.section, file)
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: '31536000' })
  if (upErr) throw new Error(upErr.message)
  const { error } = await supabase.from('site_media').update({ path }).eq('id', row.id)
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(error.message)
  }
  await supabase.storage.from(BUCKET).remove([row.path])
}

export async function updateMedia(id, patch) {
  if (!supabase) {
    demoRows = demoRows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    notify()
    return
  }
  const { error } = await supabase.from('site_media').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteMedia(row) {
  if (!supabase) {
    demoRows = demoRows.filter((r) => r.id !== row.id)
    notify()
    return
  }
  const { error } = await supabase.from('site_media').delete().eq('id', row.id)
  if (error) throw new Error(error.message)
  await supabase.storage.from(BUCKET).remove([row.path])
}

// persist a new order: rows are given in their new sequence
export async function reorderMedia(rows) {
  if (!supabase) {
    const pos = Object.fromEntries(rows.map((r, i) => [r.id, i]))
    demoRows = demoRows.map((r) => (r.id in pos ? { ...r, sort: pos[r.id] } : r))
    notify()
    return
  }
  const results = await Promise.all(rows.map((r, i) => supabase.from('site_media').update({ sort: i }).eq('id', r.id)))
  const failed = results.find((r) => r.error)
  if (failed) throw new Error(failed.error.message)
}

// calls onChange when images change; returns an unsubscribe function
export function subscribeToMedia(onChange) {
  if (!supabase) {
    listeners.add(onChange)
    return () => listeners.delete(onChange)
  }
  const channel = supabase
    .channel(`media-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_media' }, onChange)
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
