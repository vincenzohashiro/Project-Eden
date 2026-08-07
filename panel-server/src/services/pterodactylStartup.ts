import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface StartupVariable {
  name: string
  description: string
  envVariable: string
  defaultValue: string
  serverValue: string
  isEditable: boolean
  rules: string
}

interface VariableAttributes {
  name: string
  description: string
  env_variable: string
  default_value: string
  server_value: string
  is_editable: boolean
  rules: string
}

interface StartupResponse {
  data: { attributes: VariableAttributes }[]
}

export async function getStartupVariables(): Promise<StartupVariable[]> {
  const data = await pteroFetch<StartupResponse>(`/servers/${SERVER_ID}/startup`)
  return (data?.data ?? []).map((entry) => ({
    name: entry.attributes.name,
    description: entry.attributes.description,
    envVariable: entry.attributes.env_variable,
    defaultValue: entry.attributes.default_value,
    serverValue: entry.attributes.server_value,
    isEditable: entry.attributes.is_editable,
    rules: entry.attributes.rules,
  }))
}

export async function updateStartupVariable(key: string, value: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/startup/variable`, {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  })
}
