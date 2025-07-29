// InboxScreen.tsx - Award-winning redesign
import { useEffect, useState, useCallback, useRef } from 'react'
import {
    StyleSheet,
    Platform,
    ActivityIndicator,
    FlatList,
    View,
    TextInput,
    Dimensions,
    StatusBar,
    TouchableOpacity,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import {
    ThemedView,
    ThemedText,
    ThemedImage,
    ThemedTouchableOpacity,
    ThemedInputWrapper,
    ThemedIcon,
} from '../components/themed'
import { useTheme } from '../context/themeContext'
import { Feather } from '@expo/vector-icons'
import { searchUsersByEmail } from '../services/api/users'
import { fetchLatestMessagesForUser } from '../services/api/messages'
import { useRefreshableScroll } from '../hooks/useRefreshableScroll'
import { ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppHeader } from '../components/themed/AppHeader'
import { useRealtimeMessages } from '../context/MessageRealtimeContext'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type Message = {
    id: string
    title: string
    content: string
    timestamp: string
    read: boolean
    read_at?: string | null
    sender: string
    profile_url?: string | null
    otherUserId: string
    first_name?: string
    last_name?: string
    isFromMe?: boolean
    unread_count?: number
    is_unread?: boolean
    attachments?: MessageAttachment[]
}

type MessageAttachment = {
    id?: string
    message_id?: string
    url: string
    type: 'image' | 'video' | 'file'
    created_at: string
}

export default function InboxScreen() {
    const { user } = useAuth()
    const navigation = useNavigation<any>()
    const { theme } = useTheme()
    const { latestMessage, readStatusUpdates } = useRealtimeMessages()
    const [firstName, setFirstName] = useState<string | null>(null)
    const [profileUrl, setProfileUrl] = useState<string | null>(null)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [search, setSearch] = useState('')
    const [searchFocused, setSearchFocused] = useState(false)
    
    // Loading state for messages
    const [messagesLoading, setMessagesLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return
            const { data } = await supabase
                .from('users')
                .select('first_name, profile_url')
                .eq('id', user.id)
                .single()

            if (data) {
                setFirstName(data.first_name)
                setProfileUrl(data.profile_url)
            }
            setLoading(false)
        }

        fetchUserData()
    }, [user])

    useEffect(() => {
        if (!loading) {
            // Load messages when user data is ready
            loadMessages()
        }
    }, [loading])

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const runSearch = async () => {
                if (search.trim().length > 2) {
                    const results = await searchUsersByEmail(search)
                    setSearchResults(results)
                } else {
                    setSearchResults([])
                }
            }
            runSearch()
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [search])

    const loadMessages = useCallback(async () => {
        if (!user?.id) return

        setMessagesLoading(true)
        
        try {
            const data = await fetchLatestMessagesForUser(user.id)

            const mappedMessages = data.map((msg: any) => {
                const message = {
                    id: msg.id,
                    title: msg.first_name + ' ' + msg.last_name,
                    content: msg.content,
                    timestamp: msg.created_at,
                    read: !msg.is_unread,
                    read_at: msg.read_at,
                    sender: msg.first_name,
                    profile_url: msg.profile_url,
                    otherUserId: msg.sender_id === user.id ? msg.recipient_id : msg.sender_id,
                    first_name: msg.first_name,
                    last_name: msg.last_name,
                    isFromMe: msg.sender_id === user.id,
                    unread_count: msg.unread_count || 0,
                    is_unread: msg.is_unread || false,
                    attachments: msg.attachments || [],
                }
                
                return message
            })

            setMessages(mappedMessages)
        } catch (error) {
            console.error('Error loading messages:', error)
        } finally {
            setMessagesLoading(false)
        }
    }, [user])

    const { refreshControl } = useRefreshableScroll(loadMessages)

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    useFocusEffect(
        useCallback(() => {
            // Small delay to ensure navigation is complete
            setTimeout(() => {
                loadMessages()
            }, 100)
        }, [loadMessages])
    )

    // Prevent re-animations when returning to screen
    useFocusEffect(
        useCallback(() => {
            // Refresh messages when screen comes into focus
            if (!loading) {
                loadMessages()
            }
        }, [loadMessages, loading])
    )

    // Handle real-time message updates
    useEffect(() => {
        if (!latestMessage || !user?.id) return

        console.log('📨 Real-time message received:', latestMessage)

        setMessages(prevMessages => {
            // Find if this conversation already exists
            const existingMessageIndex = prevMessages.findIndex(msg => {
                const otherUserId = msg.otherUserId
                const newMessageOtherUserId = latestMessage.sender_id
                return otherUserId === newMessageOtherUserId
            })

            if (existingMessageIndex !== -1) {
                // Update existing conversation with the new message
                const updatedMessages = [...prevMessages]
                const existingMessage = updatedMessages[existingMessageIndex]
                
                // Replace the conversation with the new message (from the other user)
                updatedMessages[existingMessageIndex] = {
                    id: latestMessage.id,
                    title: latestMessage.sender_name || 'New User',
                    content: latestMessage.content,
                    timestamp: latestMessage.created_at,
                    read: false,
                    read_at: null,
                    sender: latestMessage.sender_name || 'New User',
                    profile_url: latestMessage.profile_url,
                    otherUserId: latestMessage.sender_id,
                    first_name: latestMessage.sender_name?.split(' ')[0] || 'New',
                    last_name: latestMessage.sender_name?.split(' ').slice(1).join(' ') || 'User',
                    isFromMe: false, // This is from the other user
                    unread_count: (existingMessage.unread_count || 0) + 1,
                    is_unread: true,
                    attachments: [], // We'll need to fetch attachments separately
                }
                
                // Move this conversation to the top
                const movedMessage = updatedMessages.splice(existingMessageIndex, 1)[0]
                updatedMessages.unshift(movedMessage)
                
                return updatedMessages
            } else {
                // Create new conversation
                const newConversation: Message = {
                    id: latestMessage.id,
                    title: latestMessage.sender_name || 'New User',
                    content: latestMessage.content,
                    timestamp: latestMessage.created_at,
                    read: false,
                    sender: latestMessage.sender_name || 'New User',
                    profile_url: latestMessage.profile_url,
                    otherUserId: latestMessage.sender_id,
                    first_name: latestMessage.sender_name?.split(' ')[0] || 'New',
                    last_name: latestMessage.sender_name?.split(' ').slice(1).join(' ') || 'User',
                    isFromMe: false,
                    unread_count: 1,
                    is_unread: true,
                    attachments: [], // We'll need to fetch attachments separately
                }
                
                return [newConversation, ...prevMessages]
            }
        })
    }, [latestMessage, user?.id])

    // Handle read status updates
    useEffect(() => {
        if (!readStatusUpdates.length) return

        console.log('📖 Processing read status updates:', readStatusUpdates)

        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages]
            
            readStatusUpdates.forEach(update => {
                const messageIndex = updatedMessages.findIndex(msg => msg.id === update.messageId)
                if (messageIndex !== -1) {
                    updatedMessages[messageIndex] = {
                        ...updatedMessages[messageIndex],
                        read_at: update.readAt,
                        read: true,
                        is_unread: false,
                        unread_count: 0,
                    }
                }
            })
            
            return updatedMessages
        })
    }, [readStatusUpdates])

    const today = format(new Date(), 'EEEE, MMMM d')
    const unreadCount = messages.reduce((total, msg) => total + (msg.unread_count || 0), 0)

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <View style={[styles.loadingIcon, { backgroundColor: theme.colors.primary }]}>
                        <ThemedIcon type="ionicons" name="mail" size={32} color="#fff" />
                    </View>
                    <ThemedText style={[styles.loadingText, { color: theme.colors.text }]}>
                        Loading your messages...
                    </ThemedText>
                </View>
            </ThemedView>
        )
    }

    const MessageCard = ({ item, index }: { item: Message; index: number }) => {
        const isUnread = (item.unread_count || 0) > 0
        const timeAgo = format(new Date(item.timestamp), 'h:mm a')
        const isToday = new Date(item.timestamp).toDateString() === new Date().toDateString()

        return (
            <View>
                <TouchableOpacity
                    style={[
                        styles.messageCard,
                        { 
                            backgroundColor: theme.colors.card,
                            borderColor: isUnread ? theme.colors.primary + '20' : theme.colors.border,
                        }
                    ]}
                    onPress={() => navigation.navigate('MessageThread', { userId: item.otherUserId })}
                    activeOpacity={0.8}
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        {messagesLoading ? (
                            <View style={[styles.avatar, { backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            </View>
                        ) : item.profile_url ? (
                            <ThemedImage 
                                source={{ uri: item.profile_url }} 
                                style={styles.avatar} 
                                cacheKey={item.profile_url} 
                            />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedText style={[styles.avatarInitials, { color: theme.colors.primary }]}>
                                    {item.first_name?.[0]}{item.last_name?.[0]}
                                </ThemedText>
                            </View>
                        )}
                        
                        {/* Online indicator - only show when not loading */}
                        {!messagesLoading && (
                            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
                        )}
                    </View>

                    {/* Content Section */}
                    <View style={styles.contentSection}>
                        <View style={styles.messageHeader}>
                            {messagesLoading ? (
                                <View style={[styles.loadingName, { backgroundColor: theme.colors.border }]} />
                            ) : (
                                <ThemedText style={[
                                    styles.messageName,
                                    { 
                                        color: isUnread ? theme.colors.text : theme.colors.text,
                                        fontWeight: isUnread ? '700' : '600'
                                    }
                                ]}>
                                    {item.title}
                                </ThemedText>
                            )}
                            <View style={styles.timeContainer}>
                                {messagesLoading ? (
                                    <View style={[styles.loadingTime, { backgroundColor: theme.colors.border }]} />
                                ) : (
                                    <>
                                        <ThemedText style={[styles.messageTime, { color: theme.colors.mutedText }]}>
                                            {isToday ? timeAgo : format(new Date(item.timestamp), 'MMM d')}
                                        </ThemedText>
                                        {item.isFromMe && (
                                            <ThemedIcon 
                                                type="ionicons" 
                                                name={item.read_at ? "checkmark-done" : "checkmark"} 
                                                size={12} 
                                                color={item.read_at ? theme.colors.primary : theme.colors.mutedText} 
                                            />
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        <View style={styles.messagePreview}>
                            {messagesLoading ? (
                                <View style={[styles.loadingPreview, { backgroundColor: theme.colors.border }]} />
                            ) : item.attachments && item.attachments.length > 0 ? (
                                <View style={styles.previewRow}>
                                    <ThemedText
                                        style={[
                                            styles.previewText,
                                            {
                                                color: isUnread ? theme.colors.text : theme.colors.mutedText,
                                                fontWeight: isUnread ? '500' : '400'
                                            }
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.isFromMe ? 'You: ' : `${item.first_name}: `}
                                    </ThemedText>
                                    <View style={styles.attachmentIndicator}>
                                        <ThemedIcon
                                            type="ionicons"
                                            name="image-outline"
                                            size={14}
                                            color={theme.colors.primary}
                                        />
                                        <ThemedText
                                            style={[
                                                styles.previewText,
                                                {
                                                    color: isUnread ? theme.colors.text : theme.colors.mutedText,
                                                    fontWeight: isUnread ? '500' : '400'
                                                }
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {item.attachments.length === 1 ? 'Image' : `${item.attachments.length} images`}
                                        </ThemedText>
                                    </View>
                                </View>
                            ) : (
                                <ThemedText
                                    style={[
                                        styles.previewText,
                                        {
                                            color: isUnread ? theme.colors.text : theme.colors.mutedText,
                                            fontWeight: isUnread ? '500' : '400'
                                        }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.isFromMe ? 'You: ' : `${item.first_name}: `}{item.content}
                                </ThemedText>
                            )}
                        </View>
                    </View>

                    {/* Unread Badge - only show when not loading */}
                    {!messagesLoading && isUnread && (
                        <View style={styles.unreadBadge}>
                            <ThemedText style={styles.unreadBadgeText}>
                                {(item.unread_count || 0) > 9 ? '9+' : item.unread_count}
                            </ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="dark-content" />
            
            <AppHeader title="Inbox" />

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={[
                    styles.searchContainer,
                    { 
                        backgroundColor: theme.colors.card,
                        borderColor: searchFocused ? theme.colors.primary : theme.colors.border
                    }
                ]}>
                    <ThemedIcon
                        type="ionicons"
                        name="search"
                        size={18}
                        color={theme.colors.mutedText}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        placeholder="Search conversations..."
                        placeholderTextColor={theme.colors.mutedText}
                        value={search}
                        onChangeText={setSearch}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={[styles.searchInput, { color: theme.colors.text }]}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <ThemedIcon
                                type="ionicons"
                                name="close-circle"
                                size={18}
                                color={theme.colors.mutedText}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Messages List */}
            <View style={styles.messagesSection}>
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <ThemedIcon type="ionicons" name="mail-open" size={48} color={theme.colors.primary} />
                        </View>
                        <ThemedText style={[styles.emptyTitle, { color: theme.colors.text }]}>
                            No messages yet
                        </ThemedText>
                        <ThemedText style={[styles.emptySubtitle, { color: theme.colors.mutedText }]}>
                            Start a conversation to see your messages here
                        </ThemedText>
                    </View>
                ) : (
                    <ScrollView
                        refreshControl={refreshControl}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.messagesList}
                    >
                        {messages.map((item, index) => (
                            <MessageCard key={`${item.otherUserId}-${item.id}`} item={item} index={index} />
                        ))}
                    </ScrollView>
                )}
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
    },
    loadingIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
    },

    searchSection: {
        paddingHorizontal: 24,
        marginTop: 16,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    messagesSection: {
        flex: 1,
        paddingHorizontal: 24,
    },
    messagesList: {
        paddingBottom: 24,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarSection: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarInitials: {
        fontSize: 20,
        fontWeight: '700',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    contentSection: {
        flex: 1,
        marginRight: 12,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    messageName: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    messageTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    messagePreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    previewText: {
        fontSize: 14,
        flex: 1,
    },
    attachmentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    unreadBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginLeft: 'auto',
        alignSelf: 'flex-start',
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    // Loading skeleton styles
    loadingName: {
        height: 16,
        width: 120,
        borderRadius: 8,
        marginBottom: 6,
    },
    loadingTime: {
        height: 12,
        width: 60,
        borderRadius: 6,
    },
    loadingPreview: {
        height: 14,
        width: 200,
        borderRadius: 7,
        marginTop: 4,
    },
})
