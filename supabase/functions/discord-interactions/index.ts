const BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN')!
const GUILD_ID = Deno.env.get('DISCORD_GUILD_ID')!
const PUBLIC_KEY = Deno.env.get('DISCORD_PUBLIC_KEY')!

Deno.serve(async (req) => {
  const signature = req.headers.get('x-signature-ed25519') ?? ''
  const timestamp = req.headers.get('x-signature-timestamp') ?? ''
  const rawBody = await req.text()

  // Discord requires every interaction endpoint to verify signatures
  const valid = await verifySignature(PUBLIC_KEY, signature, timestamp, rawBody)
  if (!valid) return new Response('Unauthorized', { status: 401 })

  const interaction = JSON.parse(rawBody)

  // Discord PING health check — must respond with PONG
  if (interaction.type === 1) return Response.json({ type: 1 })

  // Slash command
  if (interaction.type === 2 && interaction.data?.name === 'status') {
    try {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`,
        { headers: { Authorization: `Bot ${BOT_TOKEN}` } },
      )
      if (!res.ok) throw new Error(`Discord API ${res.status}`)
      const guild = await res.json()

      return Response.json({
        type: 4,
        data: {
          embeds: [{
            title: 'Project Eden — Server Status',
            description: [
              `**Members:** ${guild.approximate_member_count ?? '—'}`,
              `**Online now:** ${guild.approximate_presence_count ?? '—'}`,
            ].join('\n'),
            color: 0x46d6ff,
          }],
        },
      })
    } catch (err) {
      console.error('status command failed:', err)
      return Response.json({
        type: 4,
        data: { content: '⚠️ Could not reach the server right now. Try again shortly.', flags: 64 },
      })
    }
  }

  return Response.json({ type: 1 })
})

async function verifySignature(publicKey: string, sig: string, timestamp: string, body: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      hexToBytes(publicKey),
      { name: 'Ed25519' },
      false,
      ['verify'],
    )
    const message = new TextEncoder().encode(timestamp + body)
    return await crypto.subtle.verify({ name: 'Ed25519' }, key, hexToBytes(sig), message)
  } catch {
    return false
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}
