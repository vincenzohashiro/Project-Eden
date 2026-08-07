import { panelFetch, panelFetchText } from './panelFetch'

export const listFiles = (directory) => panelFetch(`/api/files?directory=${encodeURIComponent(directory)}`)
export const readFile = (file) => panelFetchText(`/api/files/content?file=${encodeURIComponent(file)}`)
// Uses the text-content-type variant so the request itself is sent as
// text/plain (matching the raw file content being written), not JSON.
export const writeFile = (file, content) =>
  panelFetchText(`/api/files/content?file=${encodeURIComponent(file)}`, { method: 'PUT', body: content })
export const createFolder = (root, name) =>
  panelFetch('/api/files/folder', { method: 'POST', body: JSON.stringify({ root, name }) })
export const renameFile = (root, from, to) =>
  panelFetch('/api/files/rename', { method: 'PUT', body: JSON.stringify({ root, from, to }) })
export const deleteFiles = (root, files) =>
  panelFetch('/api/files', { method: 'DELETE', body: JSON.stringify({ root, files }) })
export const copyFile = (location) => panelFetch('/api/files/copy', { method: 'POST', body: JSON.stringify({ location }) })
export const getUploadUrl = (directory) => panelFetch(`/api/files/upload-url?directory=${encodeURIComponent(directory)}`)
export const getDownloadUrl = (file) => panelFetch(`/api/files/download-url?file=${encodeURIComponent(file)}`)
