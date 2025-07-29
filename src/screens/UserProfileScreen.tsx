import { useEffect, useState } from 'react'
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    View,
    Modal,
    Pressable,
    Dimensions,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ThemedIcon } from '../components/themed'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText, BackButton } from '../components/themed'
import { useRefreshableScroll } from '../hooks/useRefreshableScroll'
import { AppHeader } from '../components/themed/AppHeader'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Utility function to format phone numbers
const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return 'Not provided'
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Check if it's a valid 10-digit US phone number
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    
    // If it doesn't match the expected format, return as is
    return phone
}

export default function UserProfileScreen() {
    const navigation = useNavigation()
    const route = useRoute<any>()
    const { user } = useAuth()
    const { theme } = useTheme()
    const userId = route.params?.userId

    const [profile, setProfile] = useState<{
        first_name: string
        last_name: string
        profile_url: string
        headline?: string
        banner_url?: string
        email: string
        bio?: string
        phone?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [showLightbox, setShowLightbox] = useState(false)
    const [lightboxImageError, setLightboxImageError] = useState(false)
    const [lightboxImageUrl, setLightboxImageUrl] = useState<string>('')
    const [lightboxImageType, setLightboxImageType] = useState<'profile' | 'banner'>('profile')

    const fetchProfile = async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, profile_url, headline, banner_url, email, bio, phone')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
        } else {
            setProfile(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchProfile()
    }, [userId])

    const { refreshControl } = useRefreshableScroll(fetchProfile)

    if (loading) {
        return (
            <ThemedView style={[styles.root, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </ThemedView>
        )
    }

    if (!profile) {
        return (
            <ThemedView style={[styles.root, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText style={[styles.errorText, { color: theme.colors.text }]}>
                        User not found
                    </ThemedText>
                </View>
            </ThemedView>
        )
    }

    const name = `${profile.first_name} ${profile.last_name}`

    // Debug: Log the profile URL to see if it's valid
    console.log('Profile URL for lightbox:', profile.profile_url)

    return (
        <ThemedView style={[styles.root, { backgroundColor: theme.colors.background }]}>
            <AppHeader 
                title={name}
                backButton={<BackButton />}
            >
                <TouchableOpacity 
                    style={[styles.messageButton, { backgroundColor: theme.colors.primary }]} 
                    activeOpacity={0.7}
                    onPress={() => (navigation as any).navigate('MessageThread', { userId: userId })}
                >
                    <ThemedIcon type="ionicons" name="chatbubble-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </AppHeader>
            
            <ScrollView refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                {/* Banner */}
                {profile.banner_url ? (
                    <TouchableOpacity
                        onPress={() => {
                            setLightboxImageUrl(profile.banner_url || '')
                            setLightboxImageType('banner')
                            setShowLightbox(true)
                            setLightboxImageError(false)
                        }}
                        activeOpacity={0.8}
                        style={styles.bannerWrapper}
                    >
                        <Image
                            source={{ uri: profile.banner_url || undefined }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                            onError={(e) => console.warn('Banner image load error:', e.nativeEvent.error)}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.card }]}>
                        <ThemedIcon type="feather" name="image" size={20} color={theme.colors.mutedText} />
                        <ThemedText style={[styles.bannerPrompt, { color: theme.colors.mutedText }]}>No banner photo</ThemedText>
                    </View>
                )}

                {/* Profile Info */}
                <View style={styles.profileWrapper}>
                    <TouchableOpacity
                        onPress={() => {
                            setLightboxImageUrl(profile.profile_url || '')
                            setLightboxImageType('profile')
                            setShowLightbox(true)
                            setLightboxImageError(false)
                        }}
                        activeOpacity={0.8}
                        style={styles.avatarContainer}
                    >
                    {profile.profile_url ? (
                        <Image
                            source={{ uri: profile.profile_url || undefined }}
                            style={[styles.avatar, { borderColor: theme.colors.background }]}
                        />
                    ) : (
                        <View style={[styles.avatar, { 
                            borderColor: theme.colors.background,
                            backgroundColor: theme.colors.primary + '22',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }]}>
                            <ThemedText style={{ 
                                color: theme.colors.primary, 
                                fontWeight: '700', 
                                fontSize: 36 
                            }}>
                                {profile.first_name?.[0]}
                            </ThemedText>
                        </View>
                    )}
                    </TouchableOpacity>
                    <View style={styles.info}>
                        <ThemedText style={[styles.name, { color: theme.colors.text }]}>{name}</ThemedText>
                        {profile.headline && (
                            <ThemedText style={[styles.headline, { color: theme.colors.mutedText }]}>{profile.headline}</ThemedText>
                        )}
                    </View>
                </View>

                {/* Bio Section */}
                {profile.bio && (
                    <View style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>About</ThemedText>
                        <View style={[styles.bioCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <ThemedText style={[styles.bioText, { color: theme.colors.text }]}>{profile.bio}</ThemedText>
                        </View>
                    </View>
                )}

                {/* Contact Information */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact</ThemedText>
                    <View style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="mail-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                                <ThemedText style={[styles.contactLabel, { color: theme.colors.mutedText }]}>Email</ThemedText>
                                <ThemedText style={[styles.contactValue, { color: theme.colors.text }]}>{profile.email}</ThemedText>
                            </View>
                        </View>
                        {profile.phone && (
                            <View style={[styles.contactItem, { marginBottom: 0 }]}>
                                <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <ThemedIcon type="ionicons" name="call-outline" size={18} color={theme.colors.primary} />
                                </View>
                                <View style={styles.contactInfo}>
                                    <ThemedText style={[styles.contactLabel, { color: theme.colors.mutedText }]}>Phone</ThemedText>
                                    <ThemedText style={[styles.contactValue, { color: theme.colors.text }]}>{formatPhoneNumber(profile.phone)}</ThemedText>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Actions</ThemedText>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity 
                            style={[styles.quickActionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} 
                            activeOpacity={0.7}
                            onPress={() => (navigation as any).navigate('MessageThread', { userId: userId })}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="chatbubble-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={[styles.quickActionText, { color: theme.colors.text }]}>Message</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.7}>
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="person-add-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={[styles.quickActionText, { color: theme.colors.text }]}>Add Friend</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.7}>
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="share-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={[styles.quickActionText, { color: theme.colors.text }]}>Share Profile</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.7}>
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="flag-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={[styles.quickActionText, { color: theme.colors.text }]}>Report</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Profile Picture Lightbox */}
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
                    <View style={[styles.lightboxContent, { overflow: 'visible' }]}>
                        <View style={styles.lightboxImageContainer}>
                            <Image
                                key={lightboxImageUrl}
                                source={{ uri: lightboxImageUrl }}
                                style={styles.lightboxImage}
                                resizeMode="contain"
                                onLoad={() => console.log('Lightbox image loaded')}
                                onError={(e) =>
                                    console.error('Lightbox image failed to load:', e.nativeEvent.error)
                                }
                            />
                        </View>

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
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : 24,
        paddingBottom: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    messageButton: {
        padding: 8,
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    profileWrapper: {
        marginTop: -49,
        paddingHorizontal: 24,
        alignItems: 'flex-start',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
    },
    info: {
        alignItems: 'flex-start',
        width: '100%',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        marginBottom: 8,
    },
    address: {
        fontSize: 14,
        marginBottom: 8,
    },
    headline: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    bannerWrapper: {
        width: '100%',
        height: 180,
        backgroundColor: '#ccc',
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerPlaceholder: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    bannerPrompt: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    lightboxOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxContent: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_WIDTH * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightboxImageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    lightboxImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: -60,
        right: 0,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    contactCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '400',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    quickActionCard: {
        width: '47%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    bioCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 80,
    },
    bioText: {
        fontSize: 16,
        lineHeight: 24,
    },
}) 