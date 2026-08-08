import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface ServerDetails {
  name: string
  description: string
  identifier: string
  node: string
  sftpIp: string
  sftpPort: number
}

interface ServerDetailsResponse {
  attributes: {
    name: string
    description: string
    identifier: string
    node: string
    sftp_details: { ip: string; port: number }
  }
}

export async function getServerDetails(): Promise<ServerDetails> {
  const data = await pteroFetch<ServerDetailsResponse>(`/servers/${SERVER_ID}`)
  const a = data!.attributes
  return {
    name: a.name,
    description: a.description,
    identifier: a.identifier,
    node: a.node,
    sftpIp: a.sftp_details.ip,
    sftpPort: a.sftp_details.port,
  }
}

interface AccountResponse {
  attributes: { username: string }
}

// SFTP login uses the Pterodactyl panel account's own username, not
// anything server-specific. panel-server operates as a single dedicated
// Pterodactyl user (see pterodactylClient.ts), so this is that account's
// username, same as every other proxied action.
export async function getAccountUsername(): Promise<string> {
  const data = await pteroFetch<AccountResponse>('/account')
  return data!.attributes.username
}

export async function renameServer(name: string, description: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/settings/rename`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

export async function reinstallServer(): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/settings/reinstall`, { method: 'POST' })
}
