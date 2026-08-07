import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface DatabaseEntry {
  id: string
  host: { address: string; port: number }
  name: string
  username: string
  password?: string
}

interface DatabaseAttributes {
  id: string
  host: { address: string; port: number }
  name: string
  username: string
  relationships?: { password?: { attributes: { password: string } } }
}

function toEntry(attrs: DatabaseAttributes): DatabaseEntry {
  return {
    id: attrs.id,
    host: attrs.host,
    name: attrs.name,
    username: attrs.username,
    password: attrs.relationships?.password?.attributes.password,
  }
}

interface DatabaseListResponse {
  data: { attributes: DatabaseAttributes }[]
}

export async function listDatabases(): Promise<DatabaseEntry[]> {
  const data = await pteroFetch<DatabaseListResponse>(`/servers/${SERVER_ID}/databases`)
  return (data?.data ?? []).map((entry) => toEntry(entry.attributes))
}

interface DatabaseResponse {
  attributes: DatabaseAttributes
}

export async function createDatabase(database: string, remote: string): Promise<DatabaseEntry> {
  const data = await pteroFetch<DatabaseResponse>(`/servers/${SERVER_ID}/databases`, {
    method: 'POST',
    body: JSON.stringify({ database, remote }),
  })
  return toEntry(data!.attributes)
}

export async function rotatePassword(id: string): Promise<DatabaseEntry> {
  const data = await pteroFetch<DatabaseResponse>(`/servers/${SERVER_ID}/databases/${id}/rotate-password`, {
    method: 'POST',
  })
  return toEntry(data!.attributes)
}

export async function deleteDatabase(id: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/databases/${id}`, { method: 'DELETE' })
}
