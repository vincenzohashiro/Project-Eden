import { pteroFetch, SERVER_ID } from './pterodactylClient.js'

export interface ScheduleTask {
  id: number
  action: 'command' | 'power' | 'backup'
  payload: string
  timeOffset: number
}

export interface Schedule {
  id: number
  name: string
  cron: { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string }
  isActive: boolean
  isProcessing: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  tasks: ScheduleTask[]
}

interface ScheduleAttributes {
  id: number
  name: string
  cron: { minute: string; hour: string; day_of_month: string; month: string; day_of_week: string }
  is_active: boolean
  is_processing: boolean
  last_run_at: string | null
  next_run_at: string | null
  relationships?: { tasks?: { data: { attributes: TaskAttributes }[] } }
}

interface TaskAttributes {
  id: number
  action: ScheduleTask['action']
  payload: string
  time_offset: number
}

function toSchedule(attrs: ScheduleAttributes): Schedule {
  return {
    id: attrs.id,
    name: attrs.name,
    cron: {
      minute: attrs.cron.minute,
      hour: attrs.cron.hour,
      dayOfMonth: attrs.cron.day_of_month,
      month: attrs.cron.month,
      dayOfWeek: attrs.cron.day_of_week,
    },
    isActive: attrs.is_active,
    isProcessing: attrs.is_processing,
    lastRunAt: attrs.last_run_at,
    nextRunAt: attrs.next_run_at,
    tasks: (attrs.relationships?.tasks?.data ?? []).map((t) => ({
      id: t.attributes.id,
      action: t.attributes.action,
      payload: t.attributes.payload,
      timeOffset: t.attributes.time_offset,
    })),
  }
}

interface ScheduleListResponse {
  data: { attributes: ScheduleAttributes }[]
}

export async function listSchedules(): Promise<Schedule[]> {
  const data = await pteroFetch<ScheduleListResponse>(`/servers/${SERVER_ID}/schedules`)
  return (data?.data ?? []).map((entry) => toSchedule(entry.attributes))
}

interface ScheduleResponse {
  attributes: ScheduleAttributes
}

export interface ScheduleInput {
  name: string
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  isActive: boolean
  onlyWhenOnline?: boolean
}

function scheduleBody(input: ScheduleInput) {
  return {
    name: input.name,
    minute: input.minute,
    hour: input.hour,
    day_of_month: input.dayOfMonth,
    month: input.month,
    day_of_week: input.dayOfWeek,
    is_active: input.isActive,
    only_when_online: input.onlyWhenOnline ?? false,
  }
}

export async function createSchedule(input: ScheduleInput): Promise<Schedule> {
  const data = await pteroFetch<ScheduleResponse>(`/servers/${SERVER_ID}/schedules`, {
    method: 'POST',
    body: JSON.stringify(scheduleBody(input)),
  })
  return toSchedule(data!.attributes)
}

export async function updateSchedule(id: number, input: ScheduleInput): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/schedules/${id}`, {
    method: 'POST',
    body: JSON.stringify(scheduleBody(input)),
  })
}

export async function deleteSchedule(id: number): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/schedules/${id}`, { method: 'DELETE' })
}

export async function executeSchedule(id: number): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/schedules/${id}/execute`, { method: 'POST' })
}

export async function createTask(
  scheduleId: number,
  action: ScheduleTask['action'],
  payload: string,
  timeOffset: number,
): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/schedules/${scheduleId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ action, payload, time_offset: timeOffset, continue_on_failure: false }),
  })
}

export async function deleteTask(scheduleId: number, taskId: number): Promise<void> {
  await pteroFetch(`/servers/${SERVER_ID}/schedules/${scheduleId}/tasks/${taskId}`, { method: 'DELETE' })
}
