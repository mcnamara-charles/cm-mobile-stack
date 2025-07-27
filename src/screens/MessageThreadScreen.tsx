import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  Text,
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
import { fetchMessagesBetween, sendMessage, markIncomingMessagesAsRead } from '../services/api/messages'
import { supabase } from '../services/supabaseClient'
import { TouchableWithoutFeedback, Keyboard } from 'react-native'
import { format } from 'date-fns'
import { Dimensions } from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75

export default function MessageThreadScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const { theme } = useTheme()
  const flatListRef = useRef<FlatList>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [showTimestamps, setShowTimestamps] = useState<Set<string>>(new Set())
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showLeftIcons, setShowLeftIcons] = useState(true)
  const otherUserId = route.params?.userId

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

  useEffect(() => {
    if (!user?.id || !otherUserId) return

    const loadMessages = async () => {
      const data = await fetchMessagesBetween(user.id, otherUserId)
      setMessages(data ?? [])
      setLoading(false)
    }

    const fetchOtherUser = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_url, email')
        .eq('id', otherUserId)
        .single()
      setOtherUser(data)
    }

    loadMessages()
    fetchOtherUser()
  }, [user, otherUserId])

  // Remove manual scrolling - let FlatList handle it naturally

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

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage(user!.id, otherUserId, text.trim())
    setText('')
    const data = await fetchMessagesBetween(user!.id, otherUserId)
    setMessages(data ?? [])
    // FlatList will automatically scroll to show new messages
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setShowLeftIcons(false)
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    setShowLeftIcons(true)
  }

  const handleTextChange = (newText: string) => {
    setText(newText)
    if (newText.length > 0) {
      setShowLeftIcons(false)
    }
  }

  const handleExpandButtonPress = () => {
    setShowLeftIcons(true)
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

        if (timeDiff <= fiveMinutes && message.sender_id === lastMessage.sender_id) {
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
      const existingDayGroup = dayGroups.find(day => day.date === messageDate)

      if (existingDayGroup) {
        // Check if this message belongs to the last group in this day
        const lastGroup = existingDayGroup.groups[existingDayGroup.groups.length - 1]
        if (lastGroup.length > 0) {
          const lastMessage = lastGroup[lastGroup.length - 1]
          const timeDiff = Math.abs(new Date(message.created_at).getTime() - new Date(lastMessage.created_at).getTime())
          const fiveMinutes = 5 * 60 * 1000

          if (timeDiff <= fiveMinutes) {
            lastGroup.push(message)
          } else {
            existingDayGroup.groups.push([message])
          }
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
      <View style={{ marginBottom: 12 }}>
        {/* Messages in group */}
        {item.map((message, index) => {
          const messageIsMine = message.sender_id === user?.id
          const showMessageAvatar = !messageIsMine && (index === 0 || item[index - 1]?.sender_id !== message.sender_id)
          const isFirstInGroup = index === 0
          const showTimestamp = isFirstInGroup || showTimestamps.has(message.id)
          
          return (
            <View key={message.id}>
              {/* Timestamp - shown for first message in group or when clicked */}
              {showTimestamp && (
                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={[styles.groupTimestamp, { color: theme.colors.mutedText }]}>
                    {isFirstInGroup ? timestampText : formatTime(message.created_at)}
                  </ThemedText>
                </View>
              )}
              
              {/* Message row */}
              <View style={{ flexDirection: 'row', justifyContent: messageIsMine ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                {!messageIsMine && (
                  <View style={{ width: 40, alignItems: 'center' }}>
                    {showMessageAvatar ? (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('UserProfile', { userId: otherUser?.id })}
                        activeOpacity={0.7}
                      >
                        {otherUser?.profile_url ? (
                          <ThemedImage source={{ uri: otherUser.profile_url }} style={styles.avatar} cacheKey={otherUser.profile_url} />
                        ) : (
                          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '22', justifyContent: 'center', alignItems: 'center' }]}>
                            <ThemedText style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 18 }}>
                              {otherUser?.first_name?.[0]}
                            </ThemedText>
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: 40 }} />
                    )}
                  </View>
                )}
                <View style={{ flex: 1, alignItems: messageIsMine ? 'flex-end' : 'flex-start' }}>
                  <TouchableOpacity
                    onPress={() => toggleTimestamp(message.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{
                      maxWidth: MAX_BUBBLE_WIDTH,
                      flexShrink: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 18,
                      marginBottom: 4,
                      alignSelf: messageIsMine ? 'flex-end' : 'flex-start',
                      backgroundColor: messageIsMine ? theme.colors.primary : theme.colors.card,
                      borderWidth: messageIsMine ? 0 : 1,
                      borderColor: theme.colors.border,
                      shadowColor: messageIsMine ? theme.colors.primary : theme.colors.border,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                      <Text style={{ 
                        color: messageIsMine ? '#fff' : theme.colors.text, 
                        fontSize: 16, 
                        fontWeight: '500',
                        flexWrap: 'wrap',
                        overflow: 'hidden',
                      }}>
                        {message.content}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Message Status for sent messages - only show when tapped */}
                  {messageIsMine && showTimestamps.has(message.id) && (
                    <View style={{ alignItems: 'flex-end', marginTop: 2, marginBottom: 4 }}>
                      <ThemedText style={[styles.messageStatus, { color: theme.colors.mutedText }]}>
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

  // Render function for each day section
  const renderDaySection = ({ item }: { item: { date: string; groups: any[][] } }) => {
    const dayLabel = format(new Date(item.date), 'EEEE, MMM do')

    return (
      <View style={{ marginBottom: 20 }}>
        {/* Date separator */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <ThemedText style={[styles.dateLabel, { color: theme.colors.mutedText }]}>
            {dayLabel}
          </ThemedText>
        </View>

        {/* Message groups for this day */}
        {item.groups.map((group, groupIndex) => (
          <View key={groupIndex}>
            {renderMessageGroup({ item: group })}
          </View>
        ))}
      </View>
    )
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Header */}
          <View style={[styles.header, {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border
          }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Inbox' })}
              style={styles.headerBack}
              activeOpacity={0.7}
            >
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
                    <ThemedImage source={{ uri: otherUser.profile_url }} style={styles.headerAvatar} cacheKey={otherUser.profile_url} />
                  ) : (
                    <View style={[styles.headerAvatar, { backgroundColor: theme.colors.primary + '22', justifyContent: 'center', alignItems: 'center' }]}>
                      <ThemedText style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 18 }}>
                        {otherUser.first_name?.[0]}
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
          </View>

          {/* Messages + Input */}
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={groupMessagesByDayAndTime(messages).reverse()} // Reverse to show latest first
              keyExtractor={(item) => item.date} // Key by the date
              renderItem={renderDaySection} // Render day sections
              contentContainerStyle={{ padding: 20, paddingTop: 0 }} // Minimal top padding
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              inverted={true} // Invert to show latest messages at "top"
            />

            {/* Input Bar */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
                  isInputFocused && { flex: 1, minWidth: 200 } // Moderate growth when focused
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

              {/* Send Button - Only show when there's text or input is focused */}
              {(text.trim() || isInputFocused) && (
                <ThemedTouchableOpacity
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: text.trim() ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={handleSend}
                  activeOpacity={0.8}
                  disabled={!text.trim()}
                >
                  <ThemedIcon
                    type="ionicons"
                    name="send"
                    size={20}
                    color={text.trim() ? '#fff' : theme.colors.mutedText}
                  />
                </ThemedTouchableOpacity>
              )}
            </View>
          </View>
        </ThemedView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  headerBack: { padding: 4, marginRight: 8 },
  headerUserInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerEmail: { fontSize: 13, fontWeight: '400', marginTop: 2 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 4, backgroundColor: '#eee' },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  timestamp: { fontSize: 11, marginTop: 2, marginBottom: 6, fontWeight: '400' },
  inputBarWrapper: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  dateSeparator: {
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  leftIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  expandButton: {
    padding: 4,
    marginRight: 4,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    minWidth: 120, // Base minimum width
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
      groupTimestamp: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageStatus: {
        fontSize: 11,
        fontWeight: '400',
        fontStyle: 'italic',
    },
})
