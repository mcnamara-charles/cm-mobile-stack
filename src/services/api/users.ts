import { supabase } from '../supabaseClient'

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
