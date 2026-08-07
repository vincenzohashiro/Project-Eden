import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface Backup {
  uuid: string
  name: string
  bytes: number
  createdAt: string
  completedAt: string | null
  isSuccessful: boolean
  isLocked: boolean
}

interface BackupAttributes {
  uuid: string
  name: string
  bytes: number
  created_at: string
  completed_at: string | null
  is_successful: boolean
  is_locked: boolean
}

function toBackup(attrs: BackupAttributes): Backup {
  return {
    uuid: attrs.uuid,
    name: attrs.name,
    bytes: attrs.bytes,
    createdAt: attrs.created_at,
    completedAt: attrs.completed_at,
    isSuccessful: attrs.is_successful,
    isLocked: attrs.is_locked,
  }
}

interface BackupListResponse {
  data: { attributes: BackupAttributes }[]
}

export async function listBackups(): Promise<Backup[]> {
  const data = await pteroFetch<BackupListResponse>(`/servers/${SERVER_ID}/backups`)
  return (data?.data ?? []).map((entry) => toBackup(entry.attributes))
}

interface BackupResponse {
  attributes: BackupAttributes
}

export async function createBackup(name?: string): Promise<Backup> {
  const data = await pteroFetch<BackupResponse>(`/servers/${SERVER_ID}/backups`, {
    method: 'POST',
    body: JSON.stringify(name ? { name } : {}),
  })
  return toBackup(data!.attributes)
}

interface SignedUrlResponse {
  attributes: { url: string }
}

export async function getBackupDownloadUrl(uuid: string): Promise<string> {
  const data = await pteroFetch<SignedUrlResponse>(`/servers/${SERVER_ID}/backups/${uuid}/download`)
  return data!.attributes.url
}

export async function deleteBackup(uuid: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/backups/${uuid}`, { method: 'DELETE' })
}

export async function restoreBackup(uuid: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/backups/${uuid}/restore`, {
    method: 'POST',
    body: JSON.stringify({ truncate: true }),
  })
}

export async function toggleBackupLock(uuid: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/backups/${uuid}/lock`, { method: 'POST' })
}
