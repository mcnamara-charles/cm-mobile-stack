import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'
import {
  FlatList,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  Animated,
} from 'react-native'

import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/themeContext'
import {
  ThemedView,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedIcon,
  ThemedImage,
} from '../components/themed'
import { 
  fetchMessagesBetween, 
  sendMessage, 
  markIncomingMessagesAsRead,
  pickImage,
  takePhoto,
  uploadImageAttachment,
  testAttachmentsTable,
  testImageUrl,
  testStorageBucket,
  type MessageWithAttachments,
  type MessageAttachment
} from '../services/api/messages'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { useRealtimeMessages } from '../context/MessageRealtimeContext'
import { getTypingChannelName } from '../utils/getTypingChannelName'

type Message = MessageWithAttachments

const SCREEN_WIDTH = Dimensions.get('window').width
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75

export default function MessageThreadScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const { theme } = useTheme()
  const flatListRef = useRef<FlatList>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [showTimestamps, setShowTimestamps] = useState<Set<string>>(new Set())
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showLeftIcons, setShowLeftIcons] = useState(true)
  const [selectedAttachments, setSelectedAttachments] = useState<MessageAttachment[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showImagePickerModal, setShowImagePickerModal] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string>('')
  const [lightboxImages, setLightboxImages] = useState<MessageAttachment[]>([])
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0)
  const [lightboxImageDimensions, setLightboxImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const otherUserId = route.params?.userId
  const { latestMessage } = useRealtimeMessages()
  const typingChannelRef = useRef<any>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingTimeRef = useRef<number>(0)
  const fadeAnim = useRef(new Animated.Value(0)).current

  type FlatListItem =
  | { type: 'date'; date: string }
  | { type: 'group'; messages: Message[] }

  function getFlatListItems(messages: Message[]): FlatListItem[] {
    const items: FlatListItem[] = []
    const groupedByDay = groupMessagesByDayAndTime(messages)

    groupedByDay.forEach(day => {
      items.push({ type: 'date', date: day.date })
      day.groups.forEach(group => {
        items.push({ type: 'group', messages: group })
      })
    })

    return items.reverse() // Because FlatList is inverted
  }

  // Calculate initial scroll index to start at bottom
  const getInitialScrollIndex = () => {
    const dayGroups = groupMessagesByDayAndTime(messages)
    if (dayGroups.length === 0) return 0
    
    // Count total items to get the last index
    let totalItems = 0
    dayGroups.forEach(dayGroup => {
      totalItems += dayGroup.groups.length
    })
    
    return Math.max(0, totalItems - 1)
  }

  // Function to group messages by time
  const groupMessagesByTime = (messages: any[]) => {
    const grouped: any[][] = []
    let currentGroup: any[] = []

    messages.forEach((message, index) => {
      if (currentGroup.length === 0) {
        currentGroup = [message]
      } else {
        const lastMessage = currentGroup[currentGroup.length - 1]
        const timeDiff = Math.abs(new Date(message.created_at).getTime() - new Date(lastMessage.created_at).getTime())
        const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

        if (timeDiff <= fiveMinutes) {
          currentGroup.push(message)
        } else {
          grouped.push([...currentGroup])
          currentGroup = [message]
        }
      }
    })

    if (currentGroup.length > 0) {
      grouped.push(currentGroup)
    }

    return grouped
  }

  // Function to group messages by day and time
  const groupMessagesByDayAndTime = (messages: any[]) => {
    const dayGroups: { date: string; groups: any[][] }[] = []

    messages.forEach((message) => {
      const messageDate = format(new Date(message.created_at), 'yyyy-MM-dd')
      let existingDayGroup = dayGroups.find(day => day.date === messageDate)

      if (existingDayGroup) {
        // Try to add to existing groups in this day
        let addedToGroup = false
        
        for (let i = existingDayGroup.groups.length - 1; i >= 0; i--) {
          const group = existingDayGroup.groups[i]
          if (group.length > 0) {
            const lastMessage = group[group.length - 1]
            const timeDiff = Math.abs(new Date(message.created_at).getTime() - new Date(lastMessage.created_at).getTime())
            const fiveMinutes = 5 * 60 * 1000

            // Group by time only
            if (timeDiff <= fiveMinutes) {
              group.push(message)
              addedToGroup = true
              break
            }
          }
        }
        
        // If not added to any existing group, create new group
        if (!addedToGroup) {
          existingDayGroup.groups.push([message])
        }
      } else {
        // New day
        dayGroups.push({
          date: messageDate,
          groups: [[message]]
        })
      }
    })

    return dayGroups
  }

  // Render function for each message group
  const renderMessageGroup = ({ item }: { item: any[] }) => {
    const firstMessage = item[0]
    const isMine = firstMessage.sender_id === user?.id
    const showAvatar = !isMine && (firstMessage === messages[0] || messages[messages.indexOf(firstMessage) - 1]?.sender_id !== firstMessage.sender_id)
    const messageDate = new Date(firstMessage.created_at)
    const isToday = format(messageDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    const timestampText = isToday 
      ? format(messageDate, 'h:mm a') 
      : format(messageDate, 'MMMM do, h:mm a')
    
    return (
      <View style={{ marginBottom: 0, width: '100%' }}>
        {/* Messages in group */}
        {item.map((message, index) => {
          const messageIsMine = message.sender_id === user?.id
          const showMessageAvatar = !messageIsMine && (index === 0 || item[index - 1]?.sender_id !== message.sender_id)
          const isFirstInGroup = index === 0
          const showTimestamp = isFirstInGroup || showTimestamps.has(message.id)
          
          return (
            <View key={message.id} style={{ width: '100%', marginBottom: 4 }}>
              {/* Timestamp - shown for first message in group or when clicked */}
              {showTimestamp && (
                <View style={{ 
                  alignItems: 'center', 
                  marginBottom: 16, 
                  width: '100%'
                }}>
                  <ThemedText style={[styles.groupTimestamp, { color: theme.colors.mutedText }]}>
                    {isFirstInGroup ? timestampText : formatTime(message.created_at)}
                  </ThemedText>
                </View>
              )}
              
              {/* Message row */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: messageIsMine ? 'flex-end' : 'flex-start', 
                width: '100%',
                minHeight: 40,
                paddingVertical: 0
              }}>
                {!messageIsMine && (
                  <View style={styles.avatarContainer}>
                    {showMessageAvatar ? (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('UserProfile', { userId: otherUser?.id })}
                        activeOpacity={0.7}
                      >
                        {otherUser?.profile_url ? (
                          <ThemedImage 
                            source={{ uri: otherUser.profile_url }} 
                            style={styles.messageAvatar} 
                            cacheKey={otherUser.profile_url} 
                          />
                        ) : (
                          <View style={[styles.messageAvatar, { backgroundColor: theme.colors.primary + '22', justifyContent: 'center', alignItems: 'center' }]}>
                            <ThemedText style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 18 }}>
                              {otherUser?.first_name?.[0]}
                            </ThemedText>
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.avatarSpacer} />
                    )}
                  </View>
                )}
                
                                  <View style={{ 
                    flex: 1,
                    alignItems: messageIsMine ? 'flex-end' : 'flex-start',
                    maxWidth: 250,
                    minHeight: 0
                  }}>
                  {/* Message bubble */}
                                    {/* Image attachments - separate from text bubble */}
                  {message.attachments && message.attachments.length > 0 && (
                    <View style={[styles.attachmentsContainer, { 
                      alignSelf: messageIsMine ? 'flex-end' : 'flex-start' 
                    }]}>
                      {message.attachments.length === 1 ? (
                        // Single image - full width
                        <View style={styles.attachmentWrapper}>
                          <TouchableOpacity
                            activeOpacity={0.95}
                            onPress={() => {
                              setLightboxImages(message.attachments)
                              setLightboxCurrentIndex(0)
                              setShowLightbox(true)
                            }}
                            style={styles.imageContainer}
                          >
                            <ThemedImage
                              source={{ uri: message.attachments[0].url }}
                              style={styles.messageImage}
                              resizeMode="cover"
                              cacheKey={message.attachments[0].url}
                              onLoad={() => console.log('✅ Image loaded successfully:', message.attachments[0].url)}
                              onError={(error) => {
                                console.error('❌ Image failed to load:', message.attachments[0].url, error)
                              }}
                            />
                            <View style={styles.imageOverlay}>
                              <ThemedIcon
                                type="ionicons"
                                name="expand-outline"
                                size={14}
                                color="rgba(255,255,255,0.9)"
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        // Multiple images - horizontal row with count
                        <View style={styles.multipleImagesContainer}>
                          {message.attachments.slice(0, 3).map((attachment: MessageAttachment, attachmentIndex: number) => (
                            <TouchableOpacity
                              key={attachment.id || attachmentIndex}
                              activeOpacity={0.95}
                              onPress={() => {
                                setLightboxImages(message.attachments)
                                setLightboxCurrentIndex(attachmentIndex)
                                setShowLightbox(true)
                              }}
                              style={[
                                styles.multipleImageItem,
                                attachmentIndex > 0 && { marginLeft: 4 }
                              ]}
                            >
                              <ThemedImage
                                source={{ uri: attachment.url }}
                                style={styles.multipleImage}
                                resizeMode="cover"
                                cacheKey={attachment.url}
                                onLoad={() => console.log('✅ Image loaded successfully:', attachment.url)}
                                onError={(error) => {
                                  console.error('❌ Image failed to load:', attachment.url, error)
                                }}
                              />
                              {/* Show count overlay on last visible image if there are more than 3 */}
                              {attachmentIndex === 2 && message.attachments.length > 3 && (
                                <View style={styles.imageCountOverlay}>
                                  <ThemedText style={styles.imageCountText}>
                                    +{message.attachments.length - 3}
                                  </ThemedText>
                                </View>
                              )}
                              {/* Show expand icon on last image if no count overlay */}
                              {(attachmentIndex === message.attachments.length - 1 || 
                                (attachmentIndex === 2 && message.attachments.length <= 3)) && (
                                <View style={styles.imageOverlay}>
                                  <ThemedIcon
                                    type="ionicons"
                                    name="expand-outline"
                                    size={12}
                                    color="rgba(255,255,255,0.9)"
                                  />
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  
                  {/* Message text - separate bubble */}
                  {message.content && (
                    <TouchableOpacity
                      onPress={() => toggleTimestamp(message.id)}
                      activeOpacity={0.8}
                      style={{
                        maxWidth: MAX_BUBBLE_WIDTH,
                        flexShrink: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 18,
                        marginBottom: 2,
                        alignSelf: messageIsMine ? 'flex-end' : 'flex-start',
                        backgroundColor: messageIsMine ? theme.colors.primary : theme.colors.card,
                        borderWidth: messageIsMine ? 0 : 1,
                        borderColor: theme.colors.border,
                        shadowColor: messageIsMine ? theme.colors.primary : theme.colors.border,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Text style={{ 
                        color: messageIsMine ? '#fff' : theme.colors.text, 
                        fontSize: 16, 
                        fontWeight: '500',
                        flexWrap: 'wrap',
                        overflow: 'hidden',
                      }}>
                        {message.content}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Empty bubble for timestamp if no text */}
                  {!message.content && message.attachments && message.attachments.length > 0 && (
                    <TouchableOpacity
                      onPress={() => toggleTimestamp(message.id)}
                      activeOpacity={0.8}
                      style={{
                        width: 1,
                        height: 1,
                        opacity: 0,
                        marginBottom: 2,
                        alignSelf: messageIsMine ? 'flex-end' : 'flex-start',
                      }}
                    />
                  )}
                  
                  {/* Message Status for sent messages - only show when tapped */}
                  {messageIsMine && showTimestamps.has(message.id) && (
                    <View style={{ alignItems: 'flex-end', marginTop: 4, marginBottom: 0 }}>
                      <ThemedText style={[styles.messageStatus, { 
                        color: theme.colors.mutedText,
                        fontStyle: 'italic'
                      }]}>
                        {(() => {
                          const status = getMessageStatus(message)
                          if (!status) return ''
                          return `${status.text} at ${formatStatusTime(status.timestamp)}`
                        })()}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    if (!user?.id || !otherUserId) return

    const loadInitialData = async () => {
      // Test if attachments table and storage bucket are accessible
      await Promise.all([
        testAttachmentsTable(),
        testStorageBucket()
      ])
      
      const [messageData, { data: otherUserData }] = await Promise.all([
        fetchMessagesBetween(user.id, otherUserId),
        supabase
          .from('users')
          .select('id, first_name, last_name, profile_url, email')
          .eq('id', otherUserId)
          .single(),
      ])

      setMessages(messageData ?? [])
      setOtherUser(otherUserData)
      setLoading(false)
      
      // Fade in the content when loading is complete
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }

    loadInitialData()
   
    // 🔥 Add typing indicator subscription
    // Use a shared channel name that both users can access
    const channelName = getTypingChannelName(user.id, otherUserId)
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
  }, [user?.id, otherUserId])

  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!user?.id || !otherUserId) return

      const markMessagesAsRead = async () => {
        // Mark all unread messages from the other user as read
        await markIncomingMessagesAsRead(user.id, otherUserId)
        
        // Refresh messages to reflect read status
        const data = await fetchMessagesBetween(user.id, otherUserId)
       
        setMessages(data ?? [])
        // FlatList will maintain its current scroll position
      }

      markMessagesAsRead()
    }, [user, otherUserId])
  )

  useEffect(() => {
    if (!latestMessage || !user?.id || !otherUserId) return
  
    const isCurrentThread =
      (latestMessage.sender_id === otherUserId && latestMessage.recipient_id === user.id) ||
      (latestMessage.sender_id === user.id && latestMessage.recipient_id === otherUserId)
 
    if (!isCurrentThread) return
  
    // Prevent duplicates
    setMessages(prev => {
      const alreadyExists = prev.some(msg => msg.id === latestMessage.id)
 
      if (alreadyExists) return prev
      return [...prev, latestMessage]
    })
  }, [latestMessage, user?.id, otherUserId])

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [messages.length])

    const handleSend = async () => {
    if (!text.trim() && selectedAttachments.length === 0) return
    
    setUploadingImages(true)
    
        try {
      // 1. Upload local attachments first
      const uploadedAttachments: MessageAttachment[] = []
      
      for (const attachment of selectedAttachments) {
        if (attachment.url.startsWith('file://')) {
          // Create a temporary message ID for upload
          const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
          const uploaded = await uploadImageAttachment(attachment.url, tempMessageId)
          if (uploaded) {
            // Remove the temporary message_id since it will be set by sendMessage
            const { message_id, ...attachmentWithoutMessageId } = uploaded
            uploadedAttachments.push(attachmentWithoutMessageId)
          }
        } else {
          uploadedAttachments.push(attachment)
        }
      }
      
      // 2. Send message with attachments
      const message = await sendMessage(user!.id, otherUserId, text.trim(), uploadedAttachments)
      
      if (!message) throw new Error('Failed to send message')
      
      // 3. Reset input
      setText('')
      setSelectedAttachments([])
      
      // 4. Refresh messages
      const data = await fetchMessagesBetween(user!.id, otherUserId)
      setMessages(data ?? [])
    } catch (error) {
      console.error('❌ Error sending message:', error)
      Alert.alert('Error', 'Failed to send message. Please try again.')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleTextChange = (newText: string) => {
    setText(newText)
    if (newText.length > 0) {
      setShowLeftIcons(false)
      broadcastTyping()
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setShowLeftIcons(false)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    setShowLeftIcons(true)
  }

  const handleExpandButtonPress = () => {
    setShowLeftIcons(true)
  }

  const broadcastTyping = useCallback(() => {
    const now = Date.now()
    const timeSinceLastTyping = now - lastTypingTimeRef.current
    
    // Debounce typing events - only send if 1 second has passed since last typing
    if (timeSinceLastTyping < 1000) {
      return
    }
  
    if (!typingChannelRef.current || !user?.id || !otherUserId) return
    
    typingChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id },
    })
    
    lastTypingTimeRef.current = now
  }, [user?.id, otherUserId])

  const toggleTimestamp = (messageId: string) => {
    setShowTimestamps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  function getMessageStatus(message: any) {
    if (message.sender_id !== user?.id) return null // Only for sent messages
    
    if (message.read_at) {
      return {
        type: 'read',
        timestamp: message.read_at,
        text: 'seen'
      }
    } else {
      return {
        type: 'sent',
        timestamp: message.created_at,
        text: 'sent'
      }
    }
  }

  function formatStatusTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
    
    if (isToday) {
      return format(date, 'h:mm a')
    } else {
      return format(date, 'MMM d, h:mm a')
    }
  }

    const handleImagePicker = () => {
    setShowImagePickerModal(true)
  }

  const handleTakePhoto = async () => {
    setShowImagePickerModal(false)
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
    setShowImagePickerModal(false)
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

  // Function to calculate lightbox image style based on orientation
  const getLightboxImageStyle = (dimensions: { width: number; height: number }) => {
    const { width, height } = dimensions
    const screenWidth = SCREEN_WIDTH
    const screenHeight = Dimensions.get('window').height
    
    const isPortrait = height > width
    const aspectRatio = width / height
    
    if (isPortrait) {
      // Portrait images: take up most of screen height
      const maxHeight = screenHeight * 0.8
      const calculatedWidth = maxHeight * aspectRatio
      
      return {
        width: Math.min(calculatedWidth, screenWidth * 0.9),
        height: maxHeight,
      }
    } else {
      // Landscape images: fit to screen width
      const maxWidth = screenWidth * 0.9
      const calculatedHeight = maxWidth / aspectRatio
      
      return {
        width: maxWidth,
        height: Math.min(calculatedHeight, screenHeight * 0.8),
      }
    }
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Loading Header */}
        <View style={[styles.header, {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border
        }]}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Inbox' })} style={styles.headerBack}>
            <ThemedIcon
              type="ionicons"
              name="arrow-back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <View style={styles.headerUserInfo}>
            <View style={[styles.headerAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={[styles.loadingName, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.loadingEmail, { backgroundColor: theme.colors.border }]} />
            </View>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Loading Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.colors.mutedText, marginTop: 16 }]}>
              Loading conversation...
            </ThemedText>
          </View>
        </View>

        {/* Input Bar - Always visible even during loading */}
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, width: '100%' }]}>
          <View style={styles.leftIconsContainer}>
            <ThemedTouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <ThemedIcon
                type="ionicons"
                name="add-circle-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
            <ThemedTouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <ThemedIcon
                type="ionicons"
                name="camera-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
            <ThemedTouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <ThemedIcon
                type="ionicons"
                name="images-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.textInput,
              { color: theme.colors.text },
              { flex: 1, minWidth: 120, maxWidth: '100%' }
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.mutedText}
            editable={false}
            multiline
            maxLength={1000}
          />

          <ThemedTouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: theme.colors.border,
                opacity: 0.5,
              },
            ]}
            disabled={true}
          >
            <ThemedIcon
              type="ionicons"
              name="send"
              size={20}
              color={theme.colors.mutedText}
            />
          </ThemedTouchableOpacity>
        </View>
      </ThemedView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Animated.View style={[styles.header, {
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.border,
        opacity: fadeAnim
      }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Inbox' })} style={styles.headerBack}>
          <ThemedIcon
            type="ionicons"
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        {otherUser && (
          <View style={styles.headerUserInfo}>
            <TouchableOpacity
              onPress={() => navigation.navigate('UserProfile', { userId: otherUser.id })}
              activeOpacity={0.7}
            >
              {otherUser.profile_url ? (
                <ThemedImage 
                  source={{ uri: otherUser.profile_url }} 
                  style={styles.headerAvatar} 
                  cacheKey={otherUser.profile_url} 
                />
              ) : (
                <View style={[styles.headerAvatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                  <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                    {otherUser.first_name?.[0] || 'U'}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <ThemedText style={[styles.headerName, { color: theme.colors.text }]}>
                {otherUser.first_name} {otherUser.last_name}
              </ThemedText>
              <ThemedText style={[styles.headerEmail, { color: theme.colors.mutedText }]}>
                {otherUser.email}
              </ThemedText>
            </View>
          </View>
        )}
        <View style={{ width: 24 }} />
      </Animated.View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          ref={flatListRef}
          data={getFlatListItems(messages)}
          keyExtractor={(item, index) => {
            if (item.type === 'date') {
              return `date-${item.date}-${index}`
            } else {
              return `group-${item.messages[0].id}-${index}`
            }
          }}
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                  {/* Date header */}
                  <View style={{ 
                    alignItems: 'center', 
                    paddingVertical: 24,
                    backgroundColor: theme.colors.card
                  }}>
                    <ThemedText style={[styles.dateLabel, { 
                      color: theme.colors.mutedText,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }]}>
                      {format(new Date(item.date), 'EEEE, MMM do')}
                    </ThemedText>
                  </View>
                </View>
              )
            } else {
              return (
                <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
                  {renderMessageGroup({ item: item.messages })}
                </View>
              )
            }
          }}
          inverted
          scrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingBottom: 60,
            flexGrow: 1,
            width: '100%',
            minHeight: '100%'
          }}
          style={{ flex: 1, width: '100%', backgroundColor: theme.colors.background }}
          ListFooterComponent={
            <View style={{ 
              height: 80, 
              width: '100%'
            }} />
          }
          ListHeaderComponent={
            <View style={{ 
              flex: 1,
              width: '100%'
            }} />
          }
          keyboardShouldPersistTaps="never"
          scrollEventThrottle={16}
          nestedScrollEnabled={false}
          removeClippedSubviews={false}
        />
        {/* Typing indicator */}
        {otherUserTyping && (
          <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 }}>
            <ThemedText style={[styles.typingText, { color: theme.colors.mutedText }]}>
              {otherUser?.first_name || 'User'} is typing...
            </ThemedText>
          </View>
        )}
      </Animated.View>

      {/* Selected attachments preview */}
      {selectedAttachments.length > 0 && (
        <View style={[styles.attachmentsPreview, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.attachmentsPreviewHeader}>
            <ThemedText style={[styles.attachmentsPreviewTitle, { color: theme.colors.text }]}>
              {selectedAttachments.length} image{selectedAttachments.length > 1 ? 's' : ''} selected
            </ThemedText>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={() => setSelectedAttachments([])}
            >
              <ThemedText style={[styles.clearAllText, { color: theme.colors.primary }]}>
                Clear all
              </ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedAttachments}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachmentsPreviewList}
            renderItem={({ item, index }) => (
              <View style={styles.attachmentPreviewItem}>
                <ThemedImage
                  source={{ uri: item.url }}
                  style={styles.attachmentPreviewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeAttachmentButton}
                  onPress={() => removeAttachment(index)}
                  activeOpacity={0.8}
                >
                  <ThemedIcon
                    type="ionicons"
                    name="close-circle"
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => `attachment-${index}`}
          />
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, width: '100%' }]}>
        {/* Left Icons - Only show when not focused and showLeftIcons is true */}
        {showLeftIcons && (
          <View style={styles.leftIconsContainer}>
            <ThemedTouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <ThemedIcon
                type="ionicons"
                name="add-circle-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
            <ThemedTouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={handleImagePicker}
            >
              <ThemedIcon
                type="ionicons"
                name="camera-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
            <ThemedTouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={handleImagePicker}
            >
              <ThemedIcon
                type="ionicons"
                name="images-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
          </View>
        )}

        {/* Expand Button - Only show when focused and left icons are hidden */}
        {isInputFocused && !showLeftIcons && (
          <ThemedTouchableOpacity
            style={styles.expandButton}
            onPress={handleExpandButtonPress}
            activeOpacity={0.7}
          >
            <ThemedIcon
              type="ionicons"
              name="chevron-forward"
              size={20}
              color={theme.colors.primary}
            />
          </ThemedTouchableOpacity>
        )}

        <TextInput
          style={[
            styles.textInput,
            { color: theme.colors.text },
            { flex: 1, minWidth: 120, maxWidth: '100%' } // Always flex, constrained width
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.mutedText}
          value={text}
          onChangeText={handleTextChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          multiline
          maxLength={1000}
        />

        {/* Send Button - Only show when there's text, attachments, or input is focused */}
        {(text.trim() || selectedAttachments.length > 0 || isInputFocused) && (
          <ThemedTouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: (text.trim() || selectedAttachments.length > 0) ? theme.colors.primary : theme.colors.border,
                opacity: uploadingImages ? 0.7 : 1,
              },
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!text.trim() && selectedAttachments.length === 0 || uploadingImages}
          >
            {uploadingImages ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedIcon
                type="ionicons"
                name="send"
                size={20}
                color={(text.trim() || selectedAttachments.length > 0) ? '#fff' : theme.colors.mutedText}
              />
            )}
          </ThemedTouchableOpacity>
        )}
      </View>

      {/* Custom Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePickerModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Image
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowImagePickerModal(false)}
                style={styles.modalCloseButton}
              >
                <ThemedIcon
                  type="ionicons"
                  name="close"
                  size={20}
                  color={theme.colors.mutedText}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: theme.colors.background }]}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <View style={styles.modalOptionIcon}>
                  <ThemedIcon
                    type="ionicons"
                    name="camera"
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <ThemedText style={[styles.modalOptionTitle, { color: theme.colors.text }]}>
                    Take Photo
                  </ThemedText>
                  <ThemedText style={[styles.modalOptionSubtitle, { color: theme.colors.mutedText }]}>
                    Use your camera
                  </ThemedText>
                </View>
                <ThemedIcon
                  type="ionicons"
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.mutedText}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: theme.colors.background }]}
                onPress={handleChooseFromGallery}
                activeOpacity={0.8}
              >
                <View style={styles.modalOptionIcon}>
                  <ThemedIcon
                    type="ionicons"
                    name="images"
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <ThemedText style={[styles.modalOptionTitle, { color: theme.colors.text }]}>
                    Choose from Gallery
                  </ThemedText>
                  <ThemedText style={[styles.modalOptionSubtitle, { color: theme.colors.mutedText }]}>
                    Select one or multiple photos
                  </ThemedText>
                </View>
                <ThemedIcon
                  type="ionicons"
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.mutedText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Lightbox */}
      <Modal
        visible={showLightbox}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={styles.lightboxOverlay}
          onPress={() => setShowLightbox(false)}
        >
          {/* Swipe areas for navigation */}
          {lightboxImages.length > 1 && (
            <>
              {/* Left half - go to next image */}
              {lightboxCurrentIndex < lightboxImages.length - 1 && (
                <TouchableOpacity
                  style={styles.lightboxSwipeArea}
                  onPress={() => setLightboxCurrentIndex(prev => prev + 1)}
                  activeOpacity={0}
                />
              )}
              
              {/* Right half - go to previous image */}
              {lightboxCurrentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.lightboxSwipeArea, styles.lightboxSwipeAreaRight]}
                  onPress={() => setLightboxCurrentIndex(prev => prev - 1)}
                  activeOpacity={0}
                />
              )}
            </>
          )}
          <View style={[styles.lightboxContent, { overflow: 'visible' }]}>
            <View style={styles.lightboxImageContainer}>
              <Image
                key={`lightbox-${lightboxImages[lightboxCurrentIndex]?.url}`}
                source={{ uri: lightboxImages[lightboxCurrentIndex]?.url }}
                style={[
                  styles.lightboxImage,
                  lightboxImageDimensions && getLightboxImageStyle(lightboxImageDimensions)
                ]}
                resizeMode="contain"
                onLoad={() => {
                  // Get image dimensions using Image.getSize
                  const imageUrl = lightboxImages[lightboxCurrentIndex]?.url
                  if (imageUrl) {
                    Image.getSize(imageUrl, (width, height) => {
                      setLightboxImageDimensions({ width, height })
                      console.log('Lightbox image loaded:', { width, height })
                    }, (error) => {
                      console.error('Failed to get image dimensions:', error)
                    })
                  }
                }}
                onError={(e) =>
                  console.error('Lightbox image failed to load:', e.nativeEvent.error)
                }
              />
            </View>

            {/* Image counter */}
            {lightboxImages.length > 1 && (
              <View style={styles.lightboxCounter}>
                <ThemedText style={styles.lightboxCounterText}>
                  {lightboxCurrentIndex + 1} / {lightboxImages.length}
                </ThemedText>
              </View>
            )}

            {/* Navigation arrows */}
            {lightboxImages.length > 1 && (
              <>
                {/* Left arrow */}
                {lightboxCurrentIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.lightboxArrow, styles.lightboxArrowLeft, { backgroundColor: theme.colors.card }]}
                    onPress={() => setLightboxCurrentIndex(prev => prev - 1)}
                    activeOpacity={0.8}
                  >
                    <ThemedIcon
                      type="ionicons"
                      name="chevron-back"
                      size={24}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                )}

                {/* Right arrow */}
                {lightboxCurrentIndex < lightboxImages.length - 1 && (
                  <TouchableOpacity
                    style={[styles.lightboxArrow, styles.lightboxArrowRight, { backgroundColor: theme.colors.card }]}
                    onPress={() => setLightboxCurrentIndex(prev => prev + 1)}
                    activeOpacity={0.8}
                  >
                    <ThemedIcon
                      type="ionicons"
                      name="chevron-forward"
                      size={24}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowLightbox(false)}
              activeOpacity={0.8}
            >
              <ThemedIcon
                type="ionicons"
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  headerBack: { padding: 4, marginRight: 8 },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerEmail: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  leftIconsContainer: {
    flexDirection: 'row',
    marginRight: 12,
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupTimestamp: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  avatarContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSpacer: {
    width: 40,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  messageStatus: {
    fontSize: 11,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  typingText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
    width: '100%',
    maxWidth: '100%',
  },
  expandButton: {
    padding: 4,
    marginRight: 4,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    minWidth: 120,
    maxWidth: '100%',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  attachmentsContainer: {
    marginBottom: 2,
  },
  attachmentWrapper: {
    marginBottom: 0,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageImage: {
    width: 220,
    height: 165,
    borderRadius: 12,
  },
  attachmentsPreview: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  attachmentPreviewItem: {
    marginRight: 12,
    position: 'relative',
    paddingTop: 8,
  },
  attachmentPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: 3,
    right: -7,
    backgroundColor: 'rgba(0, 0, 0, 0.29)',
    borderRadius: 10,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentsPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentsPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentsPreviewList: {
    paddingHorizontal: 16,
  },
  attachmentPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  // Multiple images horizontal row layout
  multipleImagesContainer: {
    flexDirection: 'row',
    maxWidth: 260,
  },
  multipleImageItem: {
    position: 'relative',
  },
  multipleImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageCountOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Lightbox styles
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxContent: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  lightboxCounter: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  lightboxCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lightboxArrow: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ translateY: -25 }],
    zIndex: 10,
  },
  lightboxArrowLeft: {
    left: 30,
  },
  lightboxArrowRight: {
    right: 30,
  },
  lightboxSwipeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    zIndex: 1,
  },
  lightboxSwipeAreaRight: {
    left: '50%',
  },
  lightboxImageSwipeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    zIndex: 1,
  },
  lightboxImageSwipeAreaRight: {
    left: '50%',
  },
  // Loading styles
  loadingContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingName: {
    height: 16,
    width: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  loadingEmail: {
    height: 12,
    width: 80,
    borderRadius: 6,
  },
});