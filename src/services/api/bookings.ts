// services/api/bookings.ts
import { supabase } from '../../services/supabaseClient'

export async function createBooking(booking: {
  client_id: string
  provider_id: string
  type: string
  cost_cents: number
  location: string
  details?: any
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) {
    console.error('❌ Failed to create booking:', error)
    return { success: false, error }
  }

  return { success: true, booking: data }
}

export async function fetchBookingsForUser(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Failed to fetch bookings:', error)
    return []
  }

  return data
}

export async function updateBooking(id: string, updates: Partial<{
  type: string
  cost_cents: number
  location: string
  details: any
}>) {
  const { error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('❌ Failed to update booking:', error)
    return { success: false, error }
  }

  return { success: true }
}

export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('❌ Failed to delete booking:', error)
    return { success: false, error }
  }

  return { success: true }
}

export async function createBookingEvent(event: {
    booking_id: string
    starts_at: string
    ends_at?: string
    details?: any
  }) {
    const { data, error } = await supabase
      .from('booking_events')
      .insert([event])
      .select()
      .single()
  
    if (error) {
      console.error('❌ Failed to create booking event:', error)
      return { success: false, error }
    }
  
    return { success: true, event: data }
  }
  
  export async function fetchEventsForBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('booking_events')
      .select('*')
      .eq('booking_id', bookingId)
      .order('starts_at', { ascending: true })
  
    if (error) {
      console.error('❌ Failed to fetch events:', error)
      return []
    }
  
    return data
  }