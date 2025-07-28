import { supabase } from '../supabaseClient'

// Types
export type GeneralAvailabilityInput = {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string // '09:00'
  endTime: string   // '17:00'
  startDate?: string // optional: format 'YYYY-MM-DD'
  endDate?: string   // optional
  notes?: string
}

export type BlackoutDateInput = {
  date: string // format: 'YYYY-MM-DD'
  reason?: string
}

// Create or overwrite weekly recurring availability
export async function setGeneralAvailability(
  userId: string,
  availabilities: GeneralAvailabilityInput[]
) {
  // Step 1: Delete existing recurring availability for the user
  const { error: deleteError } = await supabase
    .from('availabilities')
    .delete()
    .eq('user_id', userId)
    .eq('is_recurring', true)

  if (deleteError) {
    console.error('❌ Failed to delete existing availability:', deleteError)
    throw deleteError
  }

  // Step 2: Insert new general availability
  const payload = availabilities.map(a => ({
    user_id: userId,
    day_of_week: a.dayOfWeek,
    start_time: a.startTime,
    end_time: a.endTime,
    start_date: a.startDate ?? null,
    end_date: a.endDate ?? null,
    is_recurring: true,
    notes: a.notes ?? '',
  }))

  const { error: insertError } = await supabase
    .from('availabilities')
    .insert(payload)

  if (insertError) {
    console.error('❌ Failed to insert availability:', insertError)
    throw insertError
  }
}

// Set lead time in hours (applies to providers)
export async function setLeadTime(userId: string, hours: number) {
  const { error } = await supabase
    .from('users')
    .update({ lead_time_hours: hours })
    .eq('id', userId)

  if (error) {
    console.error('❌ Failed to update lead time:', error)
    throw error
  }
}

// Add a full-day blackout date
export async function addBlackoutDate(userId: string, blackout: BlackoutDateInput) {
  const { error } = await supabase.from('unavailabilities').insert({
    user_id: userId,
    date: blackout.date,
    start_time: null,
    end_time: null,
    reason: blackout.reason ?? '',
  })

  if (error) {
    console.error('❌ Failed to add blackout date:', error)
    throw error
  }
}

// Fetch user availability (recurring or specific)
export async function fetchUserAvailabilities(userId: string) {
  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('❌ Failed to fetch availabilities:', error)
    throw error
  }

  return data
}

// Fetch user blackout dates
export async function fetchUserUnavailabilities(userId: string) {
  const { data, error } = await supabase
    .from('unavailabilities')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('❌ Failed to fetch unavailabilities:', error)
    throw error
  }

  return data
}
