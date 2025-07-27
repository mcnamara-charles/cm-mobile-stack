import { supabase } from '../../services/supabaseClient'

/**
 * Fetch all messages between two users (in chronological order).
 */
export async function fetchMessagesBetween(userId: string, otherUserId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .in('sender_id', [userId, otherUserId])
    .in('recipient_id', [userId, otherUserId])
    .order('created_at', { ascending: true })
    .not('id', 'is', null)

  if (error) {
    console.error('❌ Failed to fetch messages:', error)
    return []
  }

  return data
}

/**
 * Send a message from one user to another.
 */
export async function sendMessage(senderId: string, recipientId: string, content: string) {
  const { error } = await supabase.from('messages').insert({
    sender_id: senderId,
    recipient_id: recipientId,
    content,
  })

  if (error) {
    console.error('❌ Failed to send message:', error)
  }
}

/**
 * Fetch the latest message per conversation for the inbox view.
 * Requires the `get_latest_messages_for_user` function in Supabase.
 */
export async function fetchLatestMessagesForUser(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
  
    if (error || !data) {
      console.error('❌ Failed to fetch messages:', error)
      return []
    }
  
    // Deduplicate to latest message per conversation
    const seen = new Map<string, any>()
    for (const message of data) {
      const otherUserId =
        message.sender_id === userId ? message.recipient_id : message.sender_id
      if (!seen.has(otherUserId)) seen.set(otherUserId, message)
    }
  
    const latestMessages = Array.from(seen.values())
  
    // Get unread message counts for each conversation
    const unreadCounts = await getUnreadMessageCounts(userId)
  
    // Collect unique user IDs to look up
    const userIds = Array.from(
      new Set(
        latestMessages.flatMap((msg) => [msg.sender_id, msg.recipient_id])
      )
    )
  
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_url')
      .in('id', userIds)
  
    if (userError || !users) {
      console.error('❌ Failed to fetch user profiles:', userError)
      return latestMessages
    }
  
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
  
    return latestMessages.map((msg) => {
      const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
      const otherUser = userMap[otherId]
      const unreadCount = unreadCounts[otherId] || 0
      const isUnread = msg.recipient_id === userId && !msg.read_at
      
      return {
        ...msg,
        first_name: otherUser?.first_name ?? 'Unknown',
        last_name: otherUser?.last_name ?? '',
        profile_url: otherUser?.profile_url ?? null,
        unread_count: unreadCount,
        is_unread: isUnread,
      }
    })
}

/**
 * Get unread message counts for a user
 */
export async function getUnreadMessageCounts(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, recipient_id, read_at')
    .eq('recipient_id', userId)
    .is('read_at', null)

  if (error) {
    console.error('❌ Failed to fetch unread messages:', error)
    return {}
  }

  // Group by sender to get count per conversation
  const unreadCounts: { [senderId: string]: number } = {}
  data?.forEach(message => {
    const senderId = message.sender_id
    unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1
  })

  return unreadCounts
}

/**
 * Mark all unread incoming messages in a thread as read.
 * Only marks messages where `recipient_id === userId` and `sender_id === otherUserId`.
 */
export async function markIncomingMessagesAsRead(userId: string, otherUserId: string) {
    const { data: unreadMessages, error } = await supabase
      .from('messages')
      .select('id')
      .eq('recipient_id', userId)
      .eq('sender_id', otherUserId)
      .is('read_at', null)
  
    if (error) {
      console.error('❌ Failed to fetch unread messages:', error)
      return { success: false, error }
    }
  
    const unreadIds = unreadMessages?.map(m => m.id) || []
  
    if (unreadIds.length === 0) {
      return { success: true, updatedCount: 0 }
    }
  
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
  
    if (updateError) {
      console.error('❌ Failed to mark messages as read:', updateError)
      return { success: false, error: updateError }
    }
  
    return { success: true, updatedCount: unreadIds.length }
  }