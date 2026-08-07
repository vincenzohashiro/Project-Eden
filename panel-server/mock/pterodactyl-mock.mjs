import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

// Stand-in for a Pterodactyl Panel + Wings node — just enough surface to
// exercise panel-server's proxy logic end-to-end without a real VPS: power/
// resources/websocket, plus files/databases/schedules/backups/network/
// startup/subusers, and a Wings-shaped console websocket.
//
// Usage: node mock/pterodactyl-mock.mjs
// Then point panel-server's .env at it:
//   PTERODACTYL_PANEL_URL=http://127.0.0.1:8080
//   PTERODACTYL_API_KEY=mock-ptero-key
//   PTERODACTYL_SERVER_ID=mock-server-id
// (Use your real SUPABASE_* values — this only fakes Pterodactyl, not auth.)

const REST_PORT = 8080
const WS_PORT = 8081
const API_KEY = 'mock-ptero-key'
const SERVER_ID = 'mock-server-id'
const PREFIX = `/api/client/servers/${SERVER_ID}`

let state = 'offline' // starting | running | stopping | offline
let startedAt = null
let rxBytes = 1_000_000
let txBytes = 500_000

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(body == null ? '' : JSON.stringify(body))
}

function text(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'text/plain' })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => resolve(body))
  })
}

function transition(signal) {
  if (signal === 'start') {
    state = 'starting'
    setTimeout(() => {
      state = 'running'
      startedAt = Date.now()
    }, 1500)
  } else if (signal === 'stop' || signal === 'kill') {
    state = signal === 'kill' ? 'offline' : 'stopping'
    setTimeout(
      () => {
        state = 'offline'
        startedAt = null
      },
      signal === 'kill' ? 0 : 1000,
    )
  } else if (signal === 'restart') {
    state = 'stopping'
    setTimeout(() => {
      state = 'starting'
      setTimeout(() => {
        state = 'running'
        startedAt = Date.now()
      }, 1500)
    }, 800)
  }
}

// ---- fake filesystem ----
const files = {
  '/': [
    { name: 'server.properties', is_file: true, size: 1420, mimetype: 'text/plain' },
    { name: 'eula.txt', is_file: true, size: 32, mimetype: 'text/plain' },
    { name: 'world', is_file: false, size: 0, mimetype: 'inode/directory' },
    { name: 'plugins', is_file: false, size: 0, mimetype: 'inode/directory' },
    { name: 'logs', is_file: false, size: 0, mimetype: 'inode/directory' },
  ],
  '/world': [
    { name: 'level.dat', is_file: true, size: 4096, mimetype: 'application/octet-stream' },
    { name: 'region', is_file: false, size: 0, mimetype: 'inode/directory' },
  ],
  '/plugins': [{ name: 'EssentialsX.jar', is_file: true, size: 2_400_000, mimetype: 'application/java-archive' }],
  '/logs': [{ name: 'latest.log', is_file: true, size: 18_200, mimetype: 'text/plain' }],
}
const fileContents = {
  '/server.properties': 'server-port=25565\nmotd=Project Eden\ndifficulty=normal\nenable-rcon=true\n',
  '/eula.txt': 'eula=true\n',
  '/logs/latest.log': '[12:00:00] [Server thread/INFO]: Done (12.345s)! For help, type "help"\n',
}

function toFileEntry(name, attrs) {
  const now = new Date().toISOString()
  return {
    object: 'file_object',
    attributes: { name, mode: attrs.is_file ? '-rw-r--r--' : 'drwxr-xr-x', mode_bits: attrs.is_file ? '644' : '755', ...attrs, is_symlink: false, created_at: now, modified_at: now },
  }
}

// ---- fake databases ----
const databases = [
  { id: 's4_1', host: { address: 'mysql.mock.local', port: 3306 }, name: 's4_gamedata', username: 'u4_gKGSzC8x9M' },
]
let dbCounter = 2

// ---- fake schedules ----
const schedules = [
  {
    id: 1,
    name: 'Daily Backup',
    cron: { minute: '0', hour: '3', day_of_month: '*', month: '*', day_of_week: '*' },
    is_active: true,
    is_processing: false,
    last_run_at: null,
    next_run_at: new Date(Date.now() + 86_400_000).toISOString(),
    tasks: [{ id: 1, action: 'backup', payload: '', time_offset: 0 }],
  },
]
let scheduleIdCounter = 2
let taskIdCounter = 2

// ---- fake backups ----
const backups = [
  {
    uuid: 'b1111111-1111-1111-1111-111111111111',
    name: 'backup-2026-08-01',
    bytes: 1_800_000_000,
    created_at: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 86_400_000 + 60_000).toISOString(),
    is_successful: true,
    is_locked: false,
  },
]

// ---- fake allocations ----
const allocations = [{ id: 1, ip: '203.0.113.10', ip_alias: 'play.projecteden.net', port: 25565, notes: 'Primary', is_default: true }]
let allocationIdCounter = 2

// ---- fake startup variables ----
const startupVariables = [
  { name: 'Server Jar File', description: 'The Minecraft server jar to run.', env_variable: 'SERVER_JARFILE', default_value: 'server.jar', server_value: 'server.jar', is_editable: true, rules: 'required|string' },
  { name: 'Minecraft Version', description: 'Version of Minecraft to run.', env_variable: 'MINECRAFT_VERSION', default_value: 'latest', server_value: 'latest', is_editable: true, rules: 'required|string' },
]

// ---- fake subusers ----
const subusers = [
  { uuid: 'c1111111-1111-1111-1111-111111111111', username: 'moderator1', email: 'mod@example.com', permissions: ['control.console', 'control.start', 'control.stop', 'file.read'] },
]

const server = createServer(async (req, res) => {
  if (req.headers.authorization !== `Bearer ${API_KEY}`) return json(res, 401, { error: 'unauthorized' })

  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname
  const method = req.method

  // ---- power / status / websocket (existing) ----
  if (p === `${PREFIX}/resources` && method === 'GET') {
    rxBytes += Math.floor(Math.random() * 50_000)
    txBytes += Math.floor(Math.random() * 20_000)
    return json(res, 200, {
      attributes: {
        current_state: state,
        is_suspended: false,
        resources: {
          memory_bytes: state === 'running' ? 1_200_000_000 + Math.random() * 500_000_000 : 0,
          cpu_absolute: state === 'running' ? Math.random() * 40 : 0,
          disk_bytes: 3_200_000_000,
          network_rx_bytes: rxBytes,
          network_tx_bytes: txBytes,
          uptime: startedAt ? Date.now() - startedAt : 0,
        },
      },
    })
  }

  if (p === `${PREFIX}/power` && method === 'POST') {
    const { signal } = JSON.parse((await readBody(req)) || '{}')
    console.log('[ptero-mock] power signal:', signal)
    transition(signal)
    return json(res, 204)
  }

  if (p === PREFIX && method === 'GET') {
    return json(res, 200, { attributes: { limits: { memory: 4096, disk: 8192, cpu: 200 } } })
  }

  if (p === `${PREFIX}/websocket` && method === 'GET') {
    return json(res, 200, { data: { token: 'mock-wings-token', socket: `ws://127.0.0.1:${WS_PORT}/ws` } })
  }

  // ---- files ----
  if (p === `${PREFIX}/files/list` && method === 'GET') {
    const dir = url.searchParams.get('directory') || '/'
    const entries = files[dir] || []
    return json(res, 200, { object: 'list', data: entries.map((e) => toFileEntry(e.name, e)) })
  }
  if (p === `${PREFIX}/files/contents` && method === 'GET') {
    const file = url.searchParams.get('file')
    return text(res, 200, fileContents[file] ?? '')
  }
  if (p === `${PREFIX}/files/write` && method === 'POST') {
    const file = url.searchParams.get('file')
    fileContents[file] = await readBody(req)
    console.log('[ptero-mock] wrote file:', file)
    return json(res, 204)
  }
  if (p === `${PREFIX}/files/create-folder` && method === 'POST') {
    const { root, name } = JSON.parse(await readBody(req))
    files[root] = files[root] || []
    files[root].push({ name, is_file: false, size: 0, mimetype: 'inode/directory' })
    return json(res, 204)
  }
  if (p === `${PREFIX}/files/rename` && method === 'PUT') {
    const { root, files: renames } = JSON.parse(await readBody(req))
    for (const { from, to } of renames) {
      const entry = (files[root] || []).find((e) => e.name === from)
      if (entry) entry.name = to
    }
    return json(res, 204)
  }
  if (p === `${PREFIX}/files/delete` && method === 'POST') {
    const { root, files: names } = JSON.parse(await readBody(req))
    files[root] = (files[root] || []).filter((e) => !names.includes(e.name))
    return json(res, 204)
  }
  if (p === `${PREFIX}/files/copy` && method === 'POST') {
    return json(res, 204)
  }
  if (p === `${PREFIX}/files/upload` && method === 'GET') {
    return json(res, 200, { attributes: { url: `http://127.0.0.1:${REST_PORT}/mock-upload` } })
  }
  if (p === `${PREFIX}/files/download` && method === 'GET') {
    return json(res, 200, { attributes: { url: `http://127.0.0.1:${REST_PORT}/mock-download` } })
  }

  // ---- databases ----
  if (p === `${PREFIX}/databases` && method === 'GET') {
    return json(res, 200, { data: databases.map((d) => ({ object: 'server_database', attributes: d })) })
  }
  if (p === `${PREFIX}/databases` && method === 'POST') {
    const { database } = JSON.parse(await readBody(req))
    const entry = { id: `s4_${dbCounter++}`, host: { address: 'mysql.mock.local', port: 3306 }, name: `s4_${database}`, username: `u4_mock${dbCounter}` }
    databases.push(entry)
    return json(res, 201, {
      object: 'server_database',
      attributes: { ...entry, relationships: { password: { attributes: { password: 'mock-generated-password' } } } },
    })
  }
  const rotateMatch = p.match(new RegExp(`^${PREFIX}/databases/([^/]+)/rotate-password$`))
  if (rotateMatch && method === 'POST') {
    const entry = databases.find((d) => d.id === rotateMatch[1])
    return json(res, 200, {
      object: 'server_database',
      attributes: { ...entry, relationships: { password: { attributes: { password: `rotated-${Date.now()}` } } } },
    })
  }
  const dbMatch = p.match(new RegExp(`^${PREFIX}/databases/([^/]+)$`))
  if (dbMatch && method === 'DELETE') {
    const idx = databases.findIndex((d) => d.id === dbMatch[1])
    if (idx >= 0) databases.splice(idx, 1)
    return json(res, 204)
  }

  // ---- schedules ----
  if (p === `${PREFIX}/schedules` && method === 'GET') {
    return json(res, 200, {
      data: schedules.map((s) => ({
        object: 'server_schedule',
        attributes: { ...s, relationships: { tasks: { data: s.tasks.map((t) => ({ attributes: t })) } } },
      })),
    })
  }
  if (p === `${PREFIX}/schedules` && method === 'POST') {
    const body = JSON.parse(await readBody(req))
    const entry = { id: scheduleIdCounter++, name: body.name, cron: { minute: body.minute, hour: body.hour, day_of_month: body.day_of_month, month: body.month, day_of_week: body.day_of_week }, is_active: body.is_active, is_processing: false, last_run_at: null, next_run_at: new Date(Date.now() + 3600_000).toISOString(), tasks: [] }
    schedules.push(entry)
    return json(res, 201, { object: 'server_schedule', attributes: { ...entry, relationships: { tasks: { data: [] } } } })
  }
  const scheduleMatch = p.match(new RegExp(`^${PREFIX}/schedules/(\\d+)$`))
  if (scheduleMatch && method === 'POST') {
    const entry = schedules.find((s) => s.id === Number(scheduleMatch[1]))
    const body = JSON.parse(await readBody(req))
    if (entry) Object.assign(entry, { name: body.name, is_active: body.is_active, cron: { minute: body.minute, hour: body.hour, day_of_month: body.day_of_month, month: body.month, day_of_week: body.day_of_week } })
    return json(res, 204)
  }
  if (scheduleMatch && method === 'DELETE') {
    const idx = schedules.findIndex((s) => s.id === Number(scheduleMatch[1]))
    if (idx >= 0) schedules.splice(idx, 1)
    return json(res, 204)
  }
  const executeMatch = p.match(new RegExp(`^${PREFIX}/schedules/(\\d+)/execute$`))
  if (executeMatch && method === 'POST') {
    return json(res, 204)
  }
  const tasksMatch = p.match(new RegExp(`^${PREFIX}/schedules/(\\d+)/tasks$`))
  if (tasksMatch && method === 'POST') {
    const schedule = schedules.find((s) => s.id === Number(tasksMatch[1]))
    const body = JSON.parse(await readBody(req))
    const task = { id: taskIdCounter++, action: body.action, payload: body.payload, time_offset: body.time_offset }
    if (schedule) schedule.tasks.push(task)
    return json(res, 201, { object: 'schedule_task', attributes: task })
  }
  const taskMatch = p.match(new RegExp(`^${PREFIX}/schedules/(\\d+)/tasks/(\\d+)$`))
  if (taskMatch && method === 'DELETE') {
    const schedule = schedules.find((s) => s.id === Number(taskMatch[1]))
    if (schedule) schedule.tasks = schedule.tasks.filter((t) => t.id !== Number(taskMatch[2]))
    return json(res, 204)
  }

  // ---- backups ----
  if (p === `${PREFIX}/backups` && method === 'GET') {
    return json(res, 200, { data: backups.map((b) => ({ object: 'backup', attributes: b })) })
  }
  if (p === `${PREFIX}/backups` && method === 'POST') {
    const body = JSON.parse((await readBody(req)) || '{}')
    const entry = { uuid: `b${Date.now()}`, name: body.name || `backup-${new Date().toISOString().slice(0, 10)}`, bytes: 0, created_at: new Date().toISOString(), completed_at: null, is_successful: null, is_locked: false }
    backups.push(entry)
    setTimeout(() => {
      entry.bytes = 1_500_000_000
      entry.completed_at = new Date().toISOString()
      entry.is_successful = true
    }, 2000)
    return json(res, 201, { object: 'backup', attributes: entry })
  }
  const backupDownloadMatch = p.match(new RegExp(`^${PREFIX}/backups/([^/]+)/download$`))
  if (backupDownloadMatch && method === 'GET') {
    return json(res, 200, { attributes: { url: `http://127.0.0.1:${REST_PORT}/mock-backup-download` } })
  }
  const backupRestoreMatch = p.match(new RegExp(`^${PREFIX}/backups/([^/]+)/restore$`))
  if (backupRestoreMatch && method === 'POST') {
    return json(res, 202)
  }
  const backupLockMatch = p.match(new RegExp(`^${PREFIX}/backups/([^/]+)/lock$`))
  if (backupLockMatch && method === 'POST') {
    const entry = backups.find((b) => b.uuid === backupLockMatch[1])
    if (entry) entry.is_locked = !entry.is_locked
    return json(res, 204)
  }
  const backupMatch = p.match(new RegExp(`^${PREFIX}/backups/([^/]+)$`))
  if (backupMatch && method === 'DELETE') {
    const idx = backups.findIndex((b) => b.uuid === backupMatch[1])
    if (idx >= 0) backups.splice(idx, 1)
    return json(res, 204)
  }

  // ---- network / allocations ----
  if (p === `${PREFIX}/network/allocations` && method === 'GET') {
    return json(res, 200, { data: allocations.map((a) => ({ object: 'allocation', attributes: a })) })
  }
  if (p === `${PREFIX}/network/allocations` && method === 'POST') {
    const entry = { id: allocationIdCounter++, ip: '203.0.113.10', ip_alias: null, port: 25565 + allocationIdCounter, notes: null, is_default: false }
    allocations.push(entry)
    return json(res, 201, { object: 'allocation', attributes: entry })
  }
  const primaryMatch = p.match(new RegExp(`^${PREFIX}/network/allocations/(\\d+)/primary$`))
  if (primaryMatch && method === 'POST') {
    for (const a of allocations) a.is_default = a.id === Number(primaryMatch[1])
    return json(res, 204)
  }
  const allocationMatch = p.match(new RegExp(`^${PREFIX}/network/allocations/(\\d+)$`))
  if (allocationMatch && method === 'POST') {
    const entry = allocations.find((a) => a.id === Number(allocationMatch[1]))
    const { notes } = JSON.parse(await readBody(req))
    if (entry) entry.notes = notes
    return json(res, 200, { object: 'allocation', attributes: entry })
  }
  if (allocationMatch && method === 'DELETE') {
    const idx = allocations.findIndex((a) => a.id === Number(allocationMatch[1]))
    if (idx >= 0) allocations.splice(idx, 1)
    return json(res, 204)
  }

  // ---- startup ----
  if (p === `${PREFIX}/startup` && method === 'GET') {
    return json(res, 200, { data: startupVariables.map((v) => ({ object: 'egg_variable', attributes: v })) })
  }
  if (p === `${PREFIX}/startup/variable` && method === 'PUT') {
    const { key, value } = JSON.parse(await readBody(req))
    const entry = startupVariables.find((v) => v.env_variable === key)
    if (entry) entry.server_value = value
    return json(res, 200, { object: 'egg_variable', attributes: entry })
  }

  // ---- subusers ----
  if (p === `${PREFIX}/users` && method === 'GET') {
    return json(res, 200, { data: subusers.map((u) => ({ object: 'subuser', attributes: u })) })
  }
  if (p === `${PREFIX}/users` && method === 'POST') {
    const { email, permissions } = JSON.parse(await readBody(req))
    const entry = { uuid: `c${Date.now()}`, username: email.split('@')[0], email, permissions }
    subusers.push(entry)
    return json(res, 201, { object: 'subuser', attributes: entry })
  }
  const subuserMatch = p.match(new RegExp(`^${PREFIX}/users/([^/]+)$`))
  if (subuserMatch && method === 'POST') {
    const entry = subusers.find((u) => u.uuid === subuserMatch[1])
    const { permissions } = JSON.parse(await readBody(req))
    if (entry) entry.permissions = permissions
    return json(res, 200, { object: 'subuser', attributes: entry })
  }
  if (subuserMatch && method === 'DELETE') {
    const idx = subusers.findIndex((u) => u.uuid === subuserMatch[1])
    if (idx >= 0) subusers.splice(idx, 1)
    return json(res, 204)
  }

  json(res, 404, { error: 'not found', path: p, method })
})

server.listen(REST_PORT, () => console.log(`[ptero-mock] REST listening on :${REST_PORT}`))

const wss = new WebSocketServer({ port: WS_PORT, path: '/ws' })
let logCounter = 0

wss.on('connection', (ws) => {
  console.log('[ptero-mock] wings client connected')
  let authed = false
  let logTimer = null

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())

    if (msg.event === 'auth') {
      authed = msg.args?.[0] === 'mock-wings-token'
      ws.send(JSON.stringify({ event: authed ? 'auth success' : 'jwt error', args: [] }))
      return
    }
    if (!authed) return

    if (msg.event === 'send logs') {
      for (let i = 0; i < 5; i += 1) {
        ws.send(JSON.stringify({ event: 'console output', args: [`[boot ${i}] Loading world "world"...`] }))
      }
      if (!logTimer) {
        logTimer = setInterval(() => {
          logCounter += 1
          ws.send(JSON.stringify({ event: 'console output', args: [`[${new Date().toLocaleTimeString()}] [Server thread/INFO]: Tick ${logCounter}`] }))
        }, 4000)
      }
      return
    }

    if (msg.event === 'send command') {
      const command = msg.args?.[0]
      setTimeout(() => {
        ws.send(JSON.stringify({ event: 'console output', args: [`[mock] executed: ${command}`] }))
      }, 300)
    }
  })

  ws.on('close', () => {
    console.log('[ptero-mock] wings client disconnected')
    if (logTimer) clearInterval(logTimer)
  })
})

console.log(`[ptero-mock] Wings WS listening on :${WS_PORT}`)
console.log('[ptero-mock] Point panel-server/.env at:')
console.log(`[ptero-mock]   PTERODACTYL_PANEL_URL=http://127.0.0.1:${REST_PORT}`)
console.log(`[ptero-mock]   PTERODACTYL_API_KEY=${API_KEY}`)
console.log(`[ptero-mock]   PTERODACTYL_SERVER_ID=${SERVER_ID}`)
