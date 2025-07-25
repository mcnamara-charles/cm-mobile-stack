import { createContext, useContext, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../services/supabaseClient'

type User = {
  id: string
  email?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  ensureValidUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Raw session on init:', session)
      console.log('Storage contents:', await AsyncStorage.getAllKeys())
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email ?? undefined }
        setUser(u)
        await ensureUserRow(u)
      }
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email ?? undefined }
        setUser(u)
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const u = { id: session.user.id, email: session.user.email ?? undefined }
          setUser(u)
          ensureUserRow(u)
        }
      }
    })

    return () => subscription.remove()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'dogstack://auth/callback'
      }
    })

    if (error) throw error

    if (data.session?.user) {
      const u = { id: data.session.user.id, email: data.session.user.email ?? undefined }
      setUser(u)
      await ensureUserRow(u)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const ensureUserRow = async (user: User) => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!data && !error) {
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
      })
      if (insertError) console.error('❌ Failed to insert user row:', insertError)
    } else if (error) {
      console.error('❌ Failed to check user row:', error)
    }
  }

  const ensureValidUser = async (): Promise<User | null> => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) {
    console.warn('⚠️ No valid Supabase session found.')
    setUser(null)
    return null
  }

  const u = { id: session.user.id, email: session.user.email ?? undefined }

  const { data, error: userRowError } = await supabase
    .from('users')
    .select('id')
    .eq('id', u.id)
    .single()

  if (userRowError || !data) {
    console.warn('⚠️ No matching user row found in users table.')
    setUser(null)
    return null
  }

  setUser(u)
  return u
}

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut, ensureValidUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
