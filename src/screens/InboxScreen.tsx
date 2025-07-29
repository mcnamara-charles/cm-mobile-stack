import { useEffect, useState, useCallback } from 'react'
import {
    StyleSheet,
    Platform,
    ActivityIndicator,
    FlatList,
    View,
    TextInput,
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
import { AppHeader } from '../components/themed/AppHeader'


type Message = {
    id: string
    title: string
    content: string
    timestamp: string
    read: boolean
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
    const [firstName, setFirstName] = useState<string | null>(null)
    const [profileUrl, setProfileUrl] = useState<string | null>(null)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [search, setSearch] = useState('')

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

        const data = await fetchLatestMessagesForUser(user.id)

        const mappedMessages = data.map((msg: any) => {
            const message = {
                id: msg.id,
                title: msg.first_name + ' ' + msg.last_name,
                content: msg.content,
                timestamp: msg.created_at,
                read: !msg.is_unread,
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
            
            // Debug: Log if message has attachments
            if (msg.attachments && msg.attachments.length > 0) {
                console.log('📷 Message has attachments:', msg.id, msg.attachments.length)
            }
            
            return message
        })

        setMessages(mappedMessages)
    }, [user])

    const { refreshControl } = useRefreshableScroll(loadMessages)

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    // Refresh messages when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // Small delay to ensure navigation is complete
            setTimeout(() => {
                loadMessages()
            }, 100)
        }, [loadMessages])
    )

    const today = format(new Date(), 'EEEE, MMM d')

    if (loading) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </ThemedView>
        )
    }

    const renderMessage = ({ item }: { item: Message }) => (
        <ThemedTouchableOpacity
            style={[
                styles.messageItem,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
            onPress={() => navigation.navigate('MessageThread', { userId: item.otherUserId })}
            activeOpacity={0.7}
        >
            <View style={styles.messageRow}>
                {/* Avatar with Badge Overlay */}
                <View style={styles.avatarContainer}>
                    {item.profile_url ? (
                        <ThemedImage source={{ uri: item.profile_url }} style={styles.messageAvatar} cacheKey={item.profile_url} />
                    ) : (
                        <View style={[styles.messageAvatar, { backgroundColor: theme.colors.primary + '22', justifyContent: 'center', alignItems: 'center' }]}>
                            <ThemedText style={[styles.avatarInitials, { color: theme.colors.primary }]}>
                                {item.first_name?.[0]}{item.last_name?.[0]}
                            </ThemedText>
                        </View>
                    )}

                    {/* Unread Badge - positioned as overlay on avatar */}
                    {(item.unread_count || 0) > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: '#FF3B30' }]}>
                            <ThemedText style={styles.unreadBadgeText}>
                                {(item.unread_count || 0) > 9 ? '9+' : item.unread_count}
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Message Content */}
                <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                        <ThemedText style={[
                            styles.messageName,
                            {
                                color: theme.colors.text,
                                fontWeight: (item.unread_count || 0) > 0 ? '700' : '600'
                            }
                        ]}>
                            {item.title}
                        </ThemedText>
                        <ThemedText style={[styles.messageTime, { color: theme.colors.mutedText }]}>
                            {format(new Date(item.timestamp), 'h:mm a')}
                        </ThemedText>
                    </View>
                    <View style={styles.messagePreviewRow}>
                        <ThemedText
                            style={[
                                styles.messagePreview,
                                {
                                    color: (item.unread_count || 0) > 0 ? theme.colors.text : theme.colors.mutedText,
                                    fontWeight: (item.unread_count || 0) > 0 ? '500' : '400'
                                }
                            ]}
                            numberOfLines={1}
                        >
                            {item.isFromMe ? 'You: ' : `${item.first_name}: `}
                        </ThemedText>
                        {item.attachments && item.attachments.length > 0 ? (
                            <View style={styles.imageIndicator}>
                                <ThemedIcon
                                    type="ionicons"
                                    name="image-outline"
                                    size={14}
                                    color={theme.colors.primary}
                                    style={{ marginRight: 4 }}
                                />
                                <ThemedText
                                    style={[
                                        styles.messagePreview,
                                        {
                                            color: (item.unread_count || 0) > 0 ? theme.colors.text : theme.colors.mutedText,
                                            fontWeight: (item.unread_count || 0) > 0 ? '500' : '400'
                                        }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.attachments.length === 1 ? 'Image' : `${item.attachments.length} images`}
                                </ThemedText>
                            </View>
                        ) : (
                            <ThemedText
                                style={[
                                    styles.messagePreview,
                                    {
                                        color: (item.unread_count || 0) > 0 ? theme.colors.text : theme.colors.mutedText,
                                        fontWeight: (item.unread_count || 0) > 0 ? '500' : '400'
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                {item.content}
                            </ThemedText>
                        )}
                    </View>
                </View>
            </View>
        </ThemedTouchableOpacity>
    )

    return (
        <ThemedView style={styles.root}>
            <AppHeader title="Inbox" />
            {/* Whole screen pulls down */}
            <ScrollView
                refreshControl={refreshControl}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Search */}
                <View style={styles.searchSection}>
                    <View style={[
                        styles.searchContainer,
                        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                        searchResults.length > 0
                            ? { borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                            : { borderRadius: 12 }
                    ]}>
                        <ThemedIcon
                            type="feather"
                            name="search"
                            size={16}
                            color={theme.colors.mutedText}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            placeholder="Search Inbox"
                            placeholderTextColor={theme.colors.mutedText}
                            value={search}
                            onChangeText={setSearch}
                            style={[styles.searchInput, { color: theme.colors.text }]}
                        />
                    </View>

                    {searchResults.length > 0 && (
                        <View style={[styles.searchResultsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <ThemedText style={[styles.searchResultsTitle, { color: theme.colors.text }]}>
                                Search Results ({searchResults.length})
                            </ThemedText>
                            {searchResults.map((user, index) => (
                                <ThemedTouchableOpacity
                                    key={user.id}
                                    onPress={() => navigation.navigate('MessageThread', { userId: user.id })}
                                    style={[
                                        styles.searchResultItem,
                                        index === searchResults.length - 1 && { borderBottomWidth: 0 }
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.searchResultAvatar}>
                                        {user.profile_url ? (
                                            <ThemedImage source={{ uri: user.profile_url }} style={styles.searchResultAvatarImage} cacheKey={user.profile_url} />
                                        ) : (
                                            <View style={[styles.searchResultInitials, { backgroundColor: theme.colors.primary + '20' }]}>
                                                <ThemedText style={[styles.searchResultInitialsText, { color: theme.colors.primary }]}>
                                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.searchResultContent}>
                                        <ThemedText style={[styles.searchResultName, { color: theme.colors.text }]}>
                                            {user.first_name} {user.last_name}
                                        </ThemedText>
                                        <ThemedText style={[styles.searchResultEmail, { color: theme.colors.mutedText }]}>
                                            {user.email}
                                        </ThemedText>
                                    </View>
                                    <ThemedIcon
                                        type="ionicons"
                                        name="chatbubble-outline"
                                        size={20}
                                        color={theme.colors.mutedText}
                                    />
                                </ThemedTouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Messages */}
                <View style={styles.messageList}>
                    {messages.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={[styles.emptyText, { color: theme.colors.mutedText }]}>
                                No messages yet
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        messages.map((item) => (
                            <View key={item.id}>
                                {renderMessage({ item })}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    userInfo: {
        flexDirection: 'column',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '600',
    },
    date: {
        fontSize: 14,
        marginTop: 2,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
    },
    searchWrapper: {
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    messageList: {
        paddingHorizontal: 24,
        // paddingTop: 12,
        paddingBottom: 24,
    },
    messageItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 48,
        alignItems: 'center',
        position: 'relative',
    },
    messageAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eee',
    },
    avatarInitials: {
        fontSize: 18,
        fontWeight: '700',
    },
    messageContent: {
        flex: 1,
        justifyContent: 'center',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    messageName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    messageTime: {
        fontSize: 12,
        fontWeight: '500',
    },

    messagePreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    imageIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messagePreview: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 18,
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    unreadBadge: {
        position: 'absolute',
        top: -3,
        right: -3,
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageSender: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        marginHorizontal: 24,
        marginTop: 30,
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    searchResultsCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        overflow: 'hidden',
        marginTop: -1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    searchResultsTitle: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
        minHeight: 64,
    },
    searchResultAvatar: {
        marginRight: 16,
    },
    searchResultAvatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    searchResultInitials: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchResultInitialsText: {
        fontSize: 16,
        fontWeight: '600',
    },
    searchResultContent: {
        flex: 1,
    },
    searchResultName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    searchResultEmail: {
        fontSize: 14,
        fontWeight: '400',
    },
})
