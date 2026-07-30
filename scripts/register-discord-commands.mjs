// Registers the bot's slash commands with Discord.
// Run locally with your own env vars, e.g.:
//   node --env-file=.env.local scripts/register-discord-commands.mjs
//
// DISCORD_GUILD_ID is optional but recommended while testing — guild-scoped
// commands show up instantly, global commands can take up to an hour to
// propagate.

const APP_ID = process.env.DISCORD_APP_ID
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const GUILD_ID = process.env.DISCORD_GUILD_ID

if (!APP_ID || !BOT_TOKEN) {
  console.error('Missing DISCORD_APP_ID or DISCORD_BOT_TOKEN in the environment.')
  process.exit(1)
}

const commands = [
  {
    name: 'status',
    description: 'Show live Project Eden server stats',
    type: 1,
  },
]

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APP_ID}/commands`

const res = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(commands),
})

if (!res.ok) {
  console.error('Failed to register commands:', res.status, await res.text())
  process.exit(1)
}

console.log('Slash commands registered:', await res.json())
