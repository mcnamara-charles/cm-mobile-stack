import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from './AuthContext'
import { fetchUserById } from '../services/api/users'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read_at?: string
  // Enriched fields
  sender_name?: string
  profile_url?: string | null
}

type UserData = {
  id: string
  first_name: string
  last_name: string
  profile_url: string | null
}

type RealtimeMessageContextType = {
  latestMessage: Message | null
}

const RealtimeMessageContext = createContext<RealtimeMessageContextType>({
  latestMessage: null,
})

export const useRealtimeMessages = () => useContext(RealtimeMessageContext)

export const RealtimeMessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [latestMessage, setLatestMessage] = useState<Message | null>(null)
  const senderCache = useRef<Map<string, UserData | null>>(new Map())

  useEffect(() => {
    if (!user?.id) return

    console.log('📡 Subscribing to realtime messages for user:', user.id)

    const channel = supabase
      .channel(`realtime-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          if (newMessage.sender_id === user.id) {
            console.log('📤 Ignoring self-sent message')
            return
          }

          let senderData = senderCache.current.get(newMessage.sender_id)

          if (!senderData) {
            try {
              senderData = await fetchUserById(newMessage.sender_id)
              if (senderData) {
                senderCache.current.set(newMessage.sender_id, senderData)
              }
            } catch (error) {
              console.error('⚠️ Failed to fetch sender data:', error)
            }
          }

          const enrichedMessage: Message = {
            ...newMessage,
            sender_name: senderData
              ? `${senderData.first_name} ${senderData.last_name}`.trim()
              : 'New message',
            profile_url: senderData?.profile_url ?? null,
          }

          console.log('✅ New enriched message:', enrichedMessage)
          setLatestMessage(() => JSON.parse(JSON.stringify(enrichedMessage)))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return (
    <RealtimeMessageContext.Provider value={{ latestMessage }}>
      {children}
    </RealtimeMessageContext.Provider>
  )
}
