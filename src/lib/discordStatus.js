import { supabase } from './supabase'

// Returns null when Supabase isn't configured yet, or the call fails —
// callers should fall back to placeholder copy in that case.
export async function fetchDiscordStatus() {
  if (!supabase) return null
  const { data, error } = await supabase.functions.invoke('discord-server-status')
  if (error) {
    console.error('discord-server-status:', error)
    return null
  }
  return data
}
