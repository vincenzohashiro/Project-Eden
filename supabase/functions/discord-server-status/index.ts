const BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN')!
const GUILD_ID = Deno.env.get('DISCORD_GUILD_ID')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`,
      { headers: { Authorization: `Bot ${BOT_TOKEN}` } },
    )
    if (!res.ok) throw new Error(`Discord API ${res.status}`)
    const guild = await res.json()

    return json({
      online: true,
      memberCount: guild.approximate_member_count ?? null,
      presenceCount: guild.approximate_presence_count ?? null,
    })
  } catch (err) {
    console.error('discord-server-status error:', err)
    return json({ online: false, memberCount: null, presenceCount: null }, 200)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      // short cache so a burst of page loads doesn't hammer Discord's API
      'Cache-Control': 'public, max-age=30',
    },
  })
}
