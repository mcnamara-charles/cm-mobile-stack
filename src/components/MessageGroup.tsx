import React, { useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedIcon, ThemedText, ThemedImage } from './themed'
import { useTheme } from '../context/themeContext'
import { MessageAttachment } from '../services/api/messages'
import { format } from 'date-fns'
import MessageStatusIndicator from './MessageStatusIndicator'
import { MessageWithAttachments } from '../types/global'

interface Message extends MessageWithAttachments {
  // Extends the global MessageWithAttachments type
}

interface MessageGroupProps {
  messages: Message[]
  otherUser: any
  currentUserId: string
  showTimestamps: Set<string>
  onToggleTimestamp: (messageId: string) => void
  onImagePress: (images: MessageAttachment[], initialIndex: number) => void
}

export default function MessageGroup({ 
  messages, 
  otherUser, 
  currentUserId, 
  showTimestamps, 
  onToggleTimestamp,
  onImagePress 
}: MessageGroupProps) {
  const navigation = useNavigation<any>()
  const { theme } = useTheme()

  const firstMessage = messages[0]
  const isMine = firstMessage.sender_id === currentUserId
  const messageDate = new Date(firstMessage.created_at)
  const isToday = format(messageDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const timestampText = isToday 
    ? format(messageDate, 'h:mm a') 
    : format(messageDate, 'MMMM do, h:mm a')

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== currentUserId) return null // Only for sent messages
    
    if ((message as any).read_at) {
      return {
        type: 'read',
        timestamp: (message as any).read_at,
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

  const formatStatusTime = (dateString: string) => {
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
    <View style={{ marginBottom: 0, width: '100%' }}>
      {/* Messages in group */}
      {messages.map((message, index) => {
        const messageIsMine = message.sender_id === currentUserId
        const showMessageAvatar = !messageIsMine && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id)
        const isFirstInGroup = index === 0
        const showTimestamp = isFirstInGroup || showTimestamps.has(message.id)
        const isOptimistic = message.isOptimistic
        
        return (
          <MessageItem 
            key={message.id} 
            message={message}
            messageIsMine={messageIsMine}
            showMessageAvatar={showMessageAvatar}
            otherUser={otherUser}
            showTimestamp={showTimestamp}
            isFirstInGroup={isFirstInGroup}
            timestampText={timestampText}
            formatTime={formatTime}
            onToggleTimestamp={onToggleTimestamp}
            onImagePress={onImagePress}
            isOptimistic={isOptimistic}
            theme={theme}
            navigation={navigation}
            showTimestamps={showTimestamps}
            getMessageStatus={getMessageStatus}
            formatStatusTime={formatStatusTime}
          />
        )
      })}
    </View>
  )
}

// Separate component for individual message items with animation
function MessageItem({ 
  message, 
  messageIsMine, 
  showMessageAvatar, 
  otherUser, 
  showTimestamp, 
  isFirstInGroup, 
  timestampText, 
  formatTime, 
  onToggleTimestamp, 
  onImagePress, 
  isOptimistic, 
  theme, 
  navigation,
  showTimestamps,
  getMessageStatus,
  formatStatusTime
}: any) {
  const slideAnim = useRef(new Animated.Value(isOptimistic ? 50 : 0)).current
  const opacityAnim = useRef(new Animated.Value(isOptimistic ? 0.8 : 1)).current

  useEffect(() => {
    if (isOptimistic) {
      // Animate optimistic messages in smoothly
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isOptimistic, slideAnim, opacityAnim])

  return (
    <Animated.View 
      style={{ 
        width: '100%', 
        marginBottom: 4,
        transform: [{ translateX: slideAnim }],
        opacity: opacityAnim,
      }}
    >
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
                    onPress={() => message.attachments && onImagePress(message.attachments, 0)}
                    style={styles.imageContainer}
                  >
                    <ThemedImage
                      source={{ uri: message.attachments![0].url }}
                      style={styles.messageImage}
                      resizeMode="cover"
                      cacheKey={message.attachments![0].url}
                      onLoad={() => console.log('✅ Image loaded successfully:', message.attachments![0].url)}
                      onError={(error) => {
                        console.error('❌ Image failed to load:', message.attachments![0].url, error)
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
                      onPress={() => message.attachments && onImagePress(message.attachments, attachmentIndex)}
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
                      {attachmentIndex === 2 && message.attachments!.length > 3 && (
                        <View style={styles.imageCountOverlay}>
                          <ThemedText style={styles.imageCountText}>
                            +{message.attachments!.length - 3}
                          </ThemedText>
                        </View>
                      )}
                      {/* Show expand icon on last image if no count overlay */}
                      {(attachmentIndex === message.attachments!.length - 1 || 
                        (attachmentIndex === 2 && message.attachments!.length <= 3)) && (
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              alignSelf: messageIsMine ? 'flex-end' : 'flex-start',
              maxWidth: 250,
            }}>
              <TouchableOpacity
                onPress={() => onToggleTimestamp(message.id)}
                activeOpacity={0.8}
                style={{
                  flexShrink: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 18,
                  marginBottom: 2,
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
              
              {/* Status indicator for sent messages */}
              {messageIsMine && (
                <MessageStatusIndicator message={message} size={14} />
              )}
            </View>
          )}
          
          {/* Empty bubble for timestamp if no text */}
          {!message.content && message.attachments && message.attachments.length > 0 && (
            <TouchableOpacity
              onPress={() => onToggleTimestamp(message.id)}
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
    </Animated.View>
  )
}

const styles = StyleSheet.create({
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
  messageStatus: {
    fontSize: 11,
    fontWeight: '400',
    fontStyle: 'italic',
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
}) 