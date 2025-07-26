import { useEffect, useState } from 'react'
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
import { useNavigation } from '@react-navigation/native'
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

type Message = {
    id: string
    title: string
    content: string
    timestamp: string
    read: boolean
    sender: string
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

    useEffect(() => {
        const mockMessages: Message[] = [
            {
                id: '1',
                title: 'Welcome to CM Mobile Stack',
                content: 'Thank you for joining our platform.',
                timestamp: new Date().toISOString(),
                read: false,
                sender: 'System',
            },
            {
                id: '2',
                title: 'Profile Update Required',
                content: 'Please complete your profile.',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                read: true,
                sender: 'Support',
            },
            {
                id: '3',
                title: 'New Feature Available',
                content: 'Check out the latest updates.',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                read: true,
                sender: 'Updates',
            },
        ]
        setMessages(mockMessages)
    }, [])

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
                    opacity: item.read ? 0.7 : 1,
                },
            ]}
            onPress={() => console.log('Message tapped:', item.id)}
        >
            <View style={styles.messageHeader}>
                <ThemedText style={[styles.messageTitle, { color: theme.colors.text }]}>
                    {item.title}
                </ThemedText>
                {!item.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                )}
            </View>
            <ThemedText
                style={[styles.messageContent, { color: theme.colors.mutedText }]}
                numberOfLines={2}
            >
                {item.content}
            </ThemedText>
            <View style={styles.messageFooter}>
                <ThemedText style={[styles.messageSender, { color: theme.colors.mutedText }]}>
                    {item.sender}
                </ThemedText>
                <ThemedText style={[styles.messageTime, { color: theme.colors.mutedText }]}>
                    {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                </ThemedText>
            </View>
        </ThemedTouchableOpacity>
    )

    return (
        <ThemedView style={styles.root}>
            <ThemedView style={[styles.header, { borderColor: theme.colors.border }]}>
                <ThemedView style={styles.userInfo}>
                    <ThemedText style={styles.greeting}>Inbox</ThemedText>
                    <ThemedText style={styles.date}>{today}</ThemedText>
                </ThemedView>
                {profileUrl && (
                    <ThemedTouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <ThemedImage source={{ uri: profileUrl }} style={styles.avatar} />
                    </ThemedTouchableOpacity>
                )}
            </ThemedView>

            {/* 🔍 Search Section */}
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
                        placeholder="Search by email"
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
                                onPress={() => {
                                    console.log('Tapped user:', user)
                                    // Later: navigate to chat or profile
                                }}
                                style={[
                                    styles.searchResultItem,
                                    index === searchResults.length - 1 && { borderBottomWidth: 0 }
                                ]}
                                activeOpacity={0.7}
                            >
                                <View style={styles.searchResultAvatar}>
                                    {user.profile_url ? (
                                        <ThemedImage 
                                            source={{ uri: user.profile_url }} 
                                            style={styles.searchResultAvatarImage}
                                        />
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

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={[styles.emptyText, { color: theme.colors.mutedText }]}>
                            No messages yet
                        </ThemedText>
                    </ThemedView>
                }
            />
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
        padding: 24,
        paddingTop: 12,
    },
    messageItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    messageContent: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
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
    messageTime: {
        fontSize: 12,
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
        paddingVertical: 12,
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
