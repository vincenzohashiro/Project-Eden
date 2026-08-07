import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'

// Service-role client: bypasses RLS, server-only. Used solely to look up
// profiles.role for authorization — never forwarded to the browser.
export const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function fetchUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data.role as string
}
