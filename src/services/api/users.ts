import { supabase } from '../supabaseClient'

export async function fetchUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, profile_url, email')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }

  return data
}

export async function searchUsersByEmail(query: string) {
  if (!query) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, profile_url, email')
    .ilike('email', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return data
}

interface UpdateUserProfileInput {
  userId: string
  first_name?: string
  last_name?: string
  headline?: string
  bio?: string
  phone?: string
  address?: string
  profile_url?: string
  banner_url?: string
}

export async function updateUserProfile({
  userId,
  first_name,
  last_name,
  headline,
  bio,
  phone,
  address,
  profile_url,
  banner_url,
}: UpdateUserProfileInput) {
  const updates: Record<string, string | undefined> = {
    first_name,
    last_name,
    headline,
    bio,
    phone,
    address,
    profile_url,
    banner_url,
  }

  // Remove undefined fields
  const payload = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  )

  const { error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', userId)

  if (error) {
    console.error('❌ Failed to update user profile:', error)
    return { success: false, error }
  }

  return { success: true }
}

export async function fetchAllProviders() {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, profile_url, email')
    .eq('is_provider', true)

  if (error) {
    console.error('❌ Failed to fetch providers:', error)
    return []
  }

  return data
}