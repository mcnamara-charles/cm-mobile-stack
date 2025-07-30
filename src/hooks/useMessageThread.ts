import { useState, useRef, useCallback, useEffect } from 'react'
import { Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { 
  fetchMessagesBetween, 
  sendMessage, 
  markIncomingMessagesAsRead,
  pickImage,
  takePhoto,
  uploadImageAttachment,
  testAttachmentsTable,
  testStorageBucket,
} from '../services/api/messages'
import { supabase } from '../services/supabaseClient'
import { useRealtimeMessages } from '../context/MessageRealtimeContext'
import { getTypingChannelName } from '../utils/getTypingChannelName'
import { User, MessageWithAttachments, MessageAttachment } from '../types/global'
import { 
  createOptimisticMessage, 
  markMessageAsSent, 
  markMessageAsFailed,
  generateTempId 
} from '../utils/messageUtils'

type Message = MessageWithAttachments

interface UseMessageThreadProps {
  currentUserId: string
  otherUserId: string
  onMessagesLoaded?: (messages: Message[]) => void
  onOtherUserLoaded?: (user: User | null) => void
  onError?: (error: string) => void
}

export function useMessageThread({
  currentUserId,
  otherUserId,
  onMessagesLoaded,
  onOtherUserLoaded,
  onError
}: UseMessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<MessageAttachment[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showImagePickerModal, setShowImagePickerModal] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<MessageAttachment[]>([])
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0)
  
  const { latestMessage } = useRealtimeMessages()
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingTimeRef = useRef<number>(0)
  const tempIdMap = useRef<Map<string, string>>(new Map())

  // Load initial data
  useEffect(() => {
    if (!currentUserId || !otherUserId) return

    const loadInitialData = async () => {
      try {
        // Test if attachments table and storage bucket are accessible
        await Promise.all([
          testAttachmentsTable(),
          testStorageBucket()
        ])
        
        const [messageData, { data: otherUserData }] = await Promise.all([
          fetchMessagesBetween(currentUserId, otherUserId),
          supabase
            .from('users')
            .select('id, first_name, last_name, profile_url, email')
            .eq('id', otherUserId)
            .single(),
        ])

        setMessages(messageData ?? [])
        setOtherUser(otherUserData)
        setLoading(false)
        
        onMessagesLoaded?.(messageData ?? [])
        onOtherUserLoaded?.(otherUserData)
      } catch (error) {
        console.error('Error loading initial data:', error)
        onError?.('Failed to load conversation data')
        setLoading(false)
      }
    }

    loadInitialData()
   
    // Add typing indicator subscription
    const channelName = getTypingChannelName(currentUserId, otherUserId)
    const typingChannel = supabase.channel(channelName)
 
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.userId === otherUserId) {
          setOtherUserTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false)
          }, 3000)
        }
      })
      .subscribe()
 
    typingChannelRef.current = typingChannel
 
    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current)
      }
      supabase.removeChannel(typingChannel)
    }
  }, [currentUserId, otherUserId, onMessagesLoaded, onOtherUserLoaded, onError])

  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!currentUserId || !otherUserId) return

      const markMessagesAsRead = async () => {
        try {
          await markIncomingMessagesAsRead(currentUserId, otherUserId)
          const data = await fetchMessagesBetween(currentUserId, otherUserId)
          setMessages(data ?? [])
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      }

      markMessagesAsRead()
    }, [currentUserId, otherUserId])
  )

  // Handle real-time messages
  useEffect(() => {
    if (!latestMessage || !currentUserId || !otherUserId) return
  
    const isCurrentThread =
      (latestMessage.sender_id === otherUserId && latestMessage.recipient_id === currentUserId) ||
      (latestMessage.sender_id === currentUserId && latestMessage.recipient_id === otherUserId)
 
    if (!isCurrentThread) return
  
    setMessages(prev => {
      const latestWithAttachments: MessageWithAttachments = {
        ...latestMessage,
        attachments: latestMessage.attachments ?? [], // <- Ensure not undefined
      }
    
      const tempId = tempIdMap.current.get(latestMessage.id)
    
      if (tempId) {
        return prev.map(msg =>
          msg.tempId === tempId
            ? { ...latestWithAttachments, isOptimistic: false, isSending: false }
            : msg
        )
      }
    
      const matchingOptimisticMessage = prev.find(msg =>
        msg.isOptimistic &&
        msg.content === latestMessage.content &&
        msg.sender_id === latestMessage.sender_id &&
        msg.recipient_id === latestMessage.recipient_id &&
        Math.abs(new Date(msg.created_at).getTime() - new Date(latestMessage.created_at).getTime()) < 5000
      )
    
      if (matchingOptimisticMessage) {
        return prev.map(msg =>
          msg.tempId === matchingOptimisticMessage.tempId
            ? { ...latestWithAttachments, isOptimistic: false, isSending: false }
            : msg
        )
      }
    
      const alreadyExists = prev.some(msg => msg.id === latestMessage.id)
      if (alreadyExists) return prev
    
      return [...prev, latestWithAttachments]
    })
  }, [latestMessage, currentUserId, otherUserId])

  // Send message with optimistic updates
  const handleSend = async (text: string) => {
    if (!text.trim() && selectedAttachments.length === 0) return
    
    // Create optimistic message immediately
    const optimisticMessage = createOptimisticMessage(
      text.trim(),
      currentUserId,
      otherUserId,
      selectedAttachments
    )
    
    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage])
    
    // Clear attachments and text (this will be handled by the parent component)
    setSelectedAttachments([])
    
    // Send message in background
    const sendPromise = sendMessageOptimistically(optimisticMessage)
    
    return sendPromise
  }

  // Background message sending with error handling
  const sendMessageOptimistically = async (optimisticMessage: Message) => {
    const tempId = optimisticMessage.tempId!
    
    try {
      setUploadingImages(true)
      
      // Upload local attachments first
      const uploadedAttachments: MessageAttachment[] = []
      
      for (const attachment of optimisticMessage.attachments || []) {
        if (attachment.url.startsWith('file://')) {
          const uploaded = await uploadImageAttachment(attachment.url, tempId)
          if (uploaded) {
            const { message_id, ...attachmentWithoutMessageId } = uploaded
            uploadedAttachments.push(attachmentWithoutMessageId)
          }
        } else {
          uploadedAttachments.push(attachment)
        }
      }
      
      // Send the actual message
      const realMessage = await sendMessage(
        currentUserId, 
        otherUserId, 
        optimisticMessage.content, 
        uploadedAttachments
      )
      
      if (!realMessage) throw new Error('Failed to send message')

      tempIdMap.current.set(realMessage.id, tempId)
      
      // Set a timeout to mark as sent if realtime doesn't come through
      setTimeout(() => {
        setMessages(prev => {
          const optimisticMsg = prev.find(msg => msg.tempId === tempId)
          if (optimisticMsg && optimisticMsg.isSending) {
            // If still sending after 3 seconds, mark as sent manually
            return prev.map(msg => 
              msg.tempId === tempId 
                ? { ...msg, isSending: false, isOptimistic: false }
                : msg
            )
          }
          return prev
        })
      }, 3000)
      
      return realMessage
    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      // Mark optimistic message as failed
      setMessages(prev => markMessageAsFailed(prev, tempId, 'Failed to send message'))
      
      // Show error alert
      Alert.alert(
        'Message Failed', 
        'Failed to send message. Tap to retry.',
        [
          { text: 'Retry', onPress: () => retryMessage(tempId) },
          { text: 'Cancel', style: 'cancel' }
        ]
      )
      
      throw error
    } finally {
      setUploadingImages(false)
    }
  }

  // Retry failed message
  const retryMessage = async (tempId: string) => {
    const failedMessage = messages.find(msg => msg.tempId === tempId)
    if (!failedMessage) return
    
    // Remove the failed message
    setMessages(prev => prev.filter(msg => msg.tempId !== tempId))
    
    // Create new optimistic message and retry
    const newOptimisticMessage = createOptimisticMessage(
      failedMessage.content,
      currentUserId,
      otherUserId,
      failedMessage.attachments
    )
    
    setMessages(prev => [...prev, newOptimisticMessage])
    sendMessageOptimistically(newOptimisticMessage)
  }

  // Typing indicator
  const broadcastTyping = useCallback(() => {
    const now = Date.now()
    const timeSinceLastTyping = now - lastTypingTimeRef.current
    
    if (timeSinceLastTyping < 1000) return
  
    if (!typingChannelRef.current || !currentUserId || !otherUserId) return
    
    typingChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId },
    })
    
    lastTypingTimeRef.current = now
  }, [currentUserId, otherUserId])

  // Image handling
  const handleTakePhoto = async () => {
    const imageUri = await takePhoto()
    if (imageUri) {
      const attachment: MessageAttachment = {
        message_id: '',
        url: imageUri,
        type: 'image',
        created_at: new Date().toISOString()
      }
      setSelectedAttachments(prev => [...prev, attachment])
    }
  }

  const handleChooseFromGallery = async () => {
    const imageUris = await pickImage()
    if (imageUris) {
      const attachments: MessageAttachment[] = Array.isArray(imageUris) 
        ? imageUris.map(uri => ({
            message_id: '',
            url: uri,
            type: 'image',
            created_at: new Date().toISOString()
          }))
        : [{
            message_id: '',
            url: imageUris,
            type: 'image',
            created_at: new Date().toISOString()
          }]
      
      setSelectedAttachments(prev => [...prev, ...attachments])
    }
  }

  const removeAttachment = (index: number) => {
    setSelectedAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const clearAttachments = () => {
    setSelectedAttachments([])
  }

  // Lightbox handling
  const openLightbox = (images: MessageAttachment[], initialIndex: number) => {
    setLightboxImages(images)
    setLightboxCurrentIndex(initialIndex)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
  }

  // Modal handling
  const openImagePicker = () => {
    setShowImagePickerModal(true)
  }

  const closeImagePicker = () => {
    setShowImagePickerModal(false)
  }

  return {
    // State
    messages,
    loading,
    otherUser,
    otherUserTyping,
    selectedAttachments,
    uploadingImages,
    showImagePickerModal,
    showLightbox,
    lightboxImages,
    lightboxCurrentIndex,
    
    // Actions
    handleSend,
    broadcastTyping,
    handleTakePhoto,
    handleChooseFromGallery,
    removeAttachment,
    clearAttachments,
    openLightbox,
    closeLightbox,
    openImagePicker,
    closeImagePicker,
  }
} 