import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface Allocation {
  id: number
  ip: string
  ipAlias: string | null
  port: number
  notes: string | null
  isDefault: boolean
}

interface AllocationAttributes {
  id: number
  ip: string
  ip_alias: string | null
  port: number
  notes: string | null
  is_default: boolean
}

function toAllocation(attrs: AllocationAttributes): Allocation {
  return {
    id: attrs.id,
    ip: attrs.ip,
    ipAlias: attrs.ip_alias,
    port: attrs.port,
    notes: attrs.notes,
    isDefault: attrs.is_default,
  }
}

interface AllocationListResponse {
  data: { attributes: AllocationAttributes }[]
}

export async function listAllocations(): Promise<Allocation[]> {
  const data = await pteroFetch<AllocationListResponse>(`/servers/${SERVER_ID}/network/allocations`)
  return (data?.data ?? []).map((entry) => toAllocation(entry.attributes))
}

interface AllocationResponse {
  attributes: AllocationAttributes
}

export async function assignAllocation(): Promise<Allocation> {
  const data = await pteroFetch<AllocationResponse>(`/servers/${SERVER_ID}/network/allocations`, {
    method: 'POST',
  })
  return toAllocation(data!.attributes)
}

export async function setPrimaryAllocation(id: number): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/network/allocations/${id}/primary`, { method: 'POST' })
}

export async function updateAllocationNotes(id: number, notes: string): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/network/allocations/${id}`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

export async function removeAllocation(id: number): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/network/allocations/${id}`, { method: 'DELETE' })
}
