import { pteroFetch, pteroFetchText, SERVER_ID } from './pterodactylClient.js'

export interface FileEntry {
  name: string
  mode: string
  size: number
  isFile: boolean
  isSymlink: boolean
  mimetype: string
  createdAt: string
  modifiedAt: string
}

interface FileListResponse {
  data: { attributes: Omit<FileEntry, 'isFile' | 'isSymlink' | 'createdAt' | 'modifiedAt'> & {
    is_file: boolean
    is_symlink: boolean
    created_at: string
    modified_at: string
  } }[]
}

export async function listFiles(directory: string): Promise<FileEntry[]> {
  const data = await pteroFetch<FileListResponse>(
    `/servers/${SERVER_ID}/files/list?directory=${encodeURIComponent(directory)}`,
  )
  return (data?.data ?? []).map((entry) => ({
    name: entry.attributes.name,
    mode: entry.attributes.mode,
    size: entry.attributes.size,
    isFile: entry.attributes.is_file,
    isSymlink: entry.attributes.is_symlink,
    mimetype: entry.attributes.mimetype,
    createdAt: entry.attributes.created_at,
    modifiedAt: entry.attributes.modified_at,
  }))
}

export function readFile(file: string): Promise<string> {
  return pteroFetchText(`/servers/${SERVER_ID}/files/contents?file=${encodeURIComponent(file)}`)
}

export async function writeFile(file: string, content: string): Promise<void> {
  await pteroFetchText(`/servers/${SERVER_ID}/files/write?file=${encodeURIComponent(file)}`, {
    method: 'POST',
    body: content,
  })
}

export async function createFolder(root: string, name: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/files/create-folder`, {
    method: 'POST',
    body: JSON.stringify({ root, name }),
  })
}

export async function renameFile(root: string, from: string, to: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/files/rename`, {
    method: 'PUT',
    body: JSON.stringify({ root, files: [{ from, to }] }),
  })
}

export async function deleteFiles(root: string, files: string[]): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/files/delete`, {
    method: 'POST',
    body: JSON.stringify({ root, files }),
  })
}

export async function copyFile(location: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/files/copy`, {
    method: 'POST',
    body: JSON.stringify({ location }),
  })
}

interface SignedUrlResponse {
  attributes: { url: string }
}

export async function getUploadUrl(directory: string): Promise<string> {
  const data = await pteroFetch<SignedUrlResponse>(
    `/servers/${SERVER_ID}/files/upload?directory=${encodeURIComponent(directory)}`,
  )
  return data!.attributes.url
}

export async function getDownloadUrl(file: string): Promise<string> {
  const data = await pteroFetch<SignedUrlResponse>(
    `/servers/${SERVER_ID}/files/download?file=${encodeURIComponent(file)}`,
  )
  return data!.attributes.url
}
