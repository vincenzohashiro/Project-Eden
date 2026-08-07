import { useCallback, useEffect, useRef, useState } from 'react'
import { getConsoleTicket } from '../lib/mcPanel'
import { buildConsoleWsUrl } from '../lib/mcConsole'

const MAX_LINES = 2000
let nextLineId = 0

function makeLine(kind, text) {
  nextLineId += 1
  return { id: nextLineId, kind, text }
}

export function useConsoleSocket({ enabled }) {
  const [lines, setLines] = useState([])
  const [connState, setConnState] = useState('idle') // idle | connecting | open | closed | error
  const wsRef = useRef(null)

  const appendLines = useCallback((newLines) => {
    setLines((prev) => {
      const combined = [...prev, ...newLines]
      return combined.length > MAX_LINES ? combined.slice(combined.length - MAX_LINES) : combined
    })
  }, [])

  const connect = useCallback(async () => {
    wsRef.current?.close()
    setConnState('connecting')

    const ticketRes = await getConsoleTicket().catch(() => null)
    const url = ticketRes?.ticket ? buildConsoleWsUrl(ticketRes.ticket) : null
    if (!url) {
      setConnState('error')
      return
    }

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setConnState('open')
    ws.onclose = () => setConnState('closed')
    ws.onerror = () => setConnState('error')
    ws.onmessage = (event) => {
      let message
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }
      if (message.type === 'backlog') {
        setLines(message.lines.map((text) => makeLine('log', text)))
      } else if (message.type === 'log') {
        appendLines([makeLine('log', message.line)])
      }
      // Wings' console is a raw stdin/stdout pipe, not RCON — sending a
      // command has no structured reply. Its output just arrives later as
      // ordinary 'log' lines; the typed command itself is echoed locally by
      // sendCommand() below, optimistically, the moment it's sent.
    }
  }, [appendLines])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const sendCommand = useCallback(
    (command) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return
      wsRef.current.send(JSON.stringify({ type: 'command', command }))
      appendLines([makeLine('command', `> ${command}`)])
    },
    [appendLines],
  )

  const clear = useCallback(() => setLines([]), [])

  useEffect(() => {
    if (!enabled) return undefined
    connect()
    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [enabled, connect])

  return { lines, connState, reconnect: connect, disconnect, sendCommand, clear }
}
