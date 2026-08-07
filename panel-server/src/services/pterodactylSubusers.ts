import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface Subuser {
  uuid: string
  username: string
  email: string
  permissions: string[]
}

interface SubuserAttributes {
  uuid: string
  username: string
  email: string
  permissions: string[]
}

interface SubuserListResponse {
  data: { attributes: SubuserAttributes }[]
}

export async function listSubusers(): Promise<Subuser[]> {
  const data = await pteroFetch<SubuserListResponse>(`/servers/${SERVER_ID}/users`)
  return (data?.data ?? []).map((entry) => entry.attributes)
}

interface SubuserResponse {
  attributes: SubuserAttributes
}

export async function createSubuser(email: string, permissions: string[]): Promise<Subuser> {
  const data = await pteroFetch<SubuserResponse>(`/servers/${SERVER_ID}/users`, {
    method: 'POST',
    body: JSON.stringify({ email, permissions }),
  })
  return data!.attributes
}

export async function updateSubuserPermissions(uuid: string, permissions: string[]): Promise<Subuser> {
  const data = await pteroFetch<SubuserResponse>(`/servers/${SERVER_ID}/users/${uuid}`, {
    method: 'POST',
    body: JSON.stringify({ permissions }),
  })
  return data!.attributes
}

export async function removeSubuser(uuid: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/users/${uuid}`, { method: 'DELETE' })
}
