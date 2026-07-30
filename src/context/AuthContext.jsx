import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const ensureProfile = useCallback(async (u) => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single()

    if (!error && data) {
      setProfile(data)
      return data
    }

    // First login — create the profile row.
    // full_name = Discord global display name, name = Discord @username
    const rawName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Colonist'
    const username = rawName.replace(/#\d+$/, '').trim() || 'Colonist'

    const { data: created } = await supabase
      .from('profiles')
      .insert({
        id: u.id,
        username,
        discord_username: u.user_metadata?.full_name ?? null,
        discord_id: u.user_metadata?.provider_id ?? null,
        avatar_url: u.user_metadata?.avatar_url ?? null,
        email: u.email,
      })
      .select()
      .single()

    setProfile(created)
    return created
  }, [])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) ensureProfile(u)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) ensureProfile(u)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [ensureProfile])

  const loginWithDiscord = (redirectPath = '/profile') => {
    if (!supabase) return
    return supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        scopes: 'identify email',
      },
    })
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = useCallback(() => {
    if (user) ensureProfile(user)
  }, [user, ensureProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithDiscord, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
