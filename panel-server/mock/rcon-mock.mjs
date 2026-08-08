import { createServer } from 'node:net'

// Minimal Source RCON protocol server — stand-in for the Minecraft server's
// RCON listener, just enough to exercise rcon.ts's player-management commands
// end-to-end without a real Minecraft process running.
//
// Usage: node mock/rcon-mock.mjs
// Then point panel-server/.env at it:
//   MC_RCON_HOST=127.0.0.1
//   MC_RCON_PORT=25575
//   MC_RCON_PASSWORD=mock-rcon-password

const PORT = 25575
const PASSWORD = 'mock-rcon-password'

const SERVERDATA_RESPONSE_VALUE = 0
const SERVERDATA_AUTH_RESPONSE = 2

let online = ['Steve', 'Alex', 'Notch']
const MAX_PLAYERS = 20
let whitelist = ['Steve', 'Alex']
const ops = new Set(['Notch'])
const banned = new Set()

function handleCommand(command) {
  const [cmd, ...args] = command.trim().split(/\s+/)

  if (cmd === 'list') {
    return `There are ${online.length} of a maximum of ${MAX_PLAYERS} players online: ${online.join(', ')}`
  }

  if (cmd === 'kick') {
    const [name] = args
    if (!online.includes(name)) return `No player was found`
    online = online.filter((n) => n !== name)
    return `Kicked ${name} from the game`
  }

  if (cmd === 'ban') {
    const [name] = args
    online = online.filter((n) => n !== name)
    banned.add(name)
    return `Banned ${name}`
  }

  if (cmd === 'pardon') {
    const [name] = args
    banned.delete(name)
    return `Unbanned ${name}`
  }

  if (cmd === 'op') {
    const [name] = args
    ops.add(name)
    return `Made ${name} a server operator`
  }

  if (cmd === 'deop') {
    const [name] = args
    ops.delete(name)
    return `Made ${name} no longer a server operator`
  }

  if (cmd === 'whitelist' && args[0] === 'list') {
    if (whitelist.length === 0) return 'There are no whitelisted players'
    return `There are ${whitelist.length} whitelisted players: ${whitelist.join(', ')}`
  }

  if (cmd === 'whitelist' && args[0] === 'add') {
    const name = args[1]
    if (!whitelist.includes(name)) whitelist.push(name)
    return `Added ${name} to the whitelist`
  }

  if (cmd === 'whitelist' && args[0] === 'remove') {
    const name = args[1]
    whitelist = whitelist.filter((n) => n !== name)
    return `Removed ${name} from the whitelist`
  }

  return `Unknown command: ${cmd}`
}

function encodePacket(id, type, body) {
  const bodyBuf = Buffer.from(body, 'utf8')
  const size = 4 + 4 + bodyBuf.length + 2
  const buf = Buffer.alloc(4 + size)
  buf.writeInt32LE(size, 0)
  buf.writeInt32LE(id, 4)
  buf.writeInt32LE(type, 8)
  bodyBuf.copy(buf, 12)
  buf.writeInt8(0, 12 + bodyBuf.length)
  buf.writeInt8(0, 12 + bodyBuf.length + 1)
  return buf
}

const server = createServer((socket) => {
  let buffer = Buffer.alloc(0)
  let authed = false
  console.log('[rcon-mock] client connected')

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk])

    while (buffer.length >= 4) {
      const size = buffer.readInt32LE(0)
      if (buffer.length < 4 + size) break

      const id = buffer.readInt32LE(4)
      const type = buffer.readInt32LE(8)
      const body = buffer.toString('utf8', 12, 4 + size - 2)
      buffer = buffer.subarray(4 + size)

      if (type === 3) {
        // SERVERDATA_AUTH
        authed = body === PASSWORD
        socket.write(encodePacket(authed ? id : -1, SERVERDATA_AUTH_RESPONSE, ''))
        continue
      }

      if (!authed) {
        socket.write(encodePacket(id, SERVERDATA_RESPONSE_VALUE, 'Not authenticated'))
        continue
      }

      const response = handleCommand(body)
      console.log('[rcon-mock] command:', body, '->', response)
      socket.write(encodePacket(id, SERVERDATA_RESPONSE_VALUE, response))
    }
  })

  socket.on('close', () => console.log('[rcon-mock] client disconnected'))
  socket.on('error', () => {})
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[rcon-mock] RCON listening on :${PORT}`)
  console.log('[rcon-mock] Point panel-server/.env at:')
  console.log(`[rcon-mock]   MC_RCON_HOST=127.0.0.1`)
  console.log(`[rcon-mock]   MC_RCON_PORT=${PORT}`)
  console.log(`[rcon-mock]   MC_RCON_PASSWORD=${PASSWORD}`)
})
