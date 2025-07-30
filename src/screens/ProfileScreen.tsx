import React from 'react'
import { useEffect, useState } from 'react'
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    Alert,
    View,
    Dimensions,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { ThemedIcon } from '../components/themed'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { SUPABASE_URL } from '../../config'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText, BackButton } from '../components/themed'
import ImageLightbox from '../components/ImageLightbox'
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

export default function ProfileScreen() {
    const navigation = useNavigation()
    const { user } = useAuth()
    const { theme } = useTheme()

    const [profile, setProfile] = useState<{
        first_name: string
        last_name: string
        profile_url: string
        headline?: string
        banner_url?: string
        bio?: string
        email?: string
        phone?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [showLightbox, setShowLightbox] = useState(false)
    const [lightboxImageUrl, setLightboxImageUrl] = useState<string>('')

    const fetchProfile = async () => {
        if (!user) return
        const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, profile_url, headline, banner_url, email, phone, bio')
            .eq('id', user.id)
            .single()
        if (error) {
            console.error('Error fetching profile:', error)
        } else {
            setProfile(data)
        }
        setLoading(false)
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile()
        }, [user])
    )

    const { refreshControl } = useRefreshableScroll(fetchProfile)

    const uploadBannerImage = async () => {
        if (!user) return
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 1],
                quality: 0.7,
            })

            if (result.canceled || !result.assets?.[0]?.uri) return

            const manipulated = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            )

            const fileName = `${user.id}-banner.jpeg`
            const uploadUrl = `${SUPABASE_URL}/storage/v1/object/profile-pictures/${fileName}`
            const session = await supabase.auth.getSession()
            const accessToken = session.data.session?.access_token
            if (!accessToken) throw new Error('Missing access token')

            const uploadResponse = await FileSystem.uploadAsync(uploadUrl, manipulated.uri, {
                httpMethod: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'image/jpeg',
                    'Cache-Control': '3600',
                },
            })

            if (uploadResponse.status !== 200) {
                throw new Error(`Upload failed with status ${uploadResponse.status}`)
            }

            const { data: publicUrlData } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName)

            if (!publicUrlData?.publicUrl) {
                throw new Error('Failed to get public URL')
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({ banner_url: publicUrlData.publicUrl })
                .eq('id', user.id)

            if (updateError) {
                throw updateError
            }

            // Refresh profile data
            const { data: updatedProfile } = await supabase
                .from('users')
                .select('banner_url')
                .eq('id', user.id)
                .single()

            if (updatedProfile) {
                setProfile(prev => prev ? { ...prev, banner_url: updatedProfile.banner_url } : null)
            }

        } catch (error) {
            console.error('Error uploading banner:', error)
            Alert.alert('Error', 'Failed to upload banner image')
        }
    }

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
                        Profile not found
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
                backButton={<BackButton iconName="arrow-back" />}
            >
                <TouchableOpacity 
                    style={styles.headerButton} 
                    activeOpacity={0.7}
                    onPress={() => (navigation as any).navigate('EditProfile')}
                >
                    <ThemedIcon type="feather" name="edit-2" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
            </AppHeader>
            
            <ScrollView refreshControl={refreshControl} showsVerticalScrollIndicator={false}>
                {profile.banner_url ? (
                    <TouchableOpacity
                        onPress={() => {
                            setLightboxImageUrl(profile.banner_url || '')
                            setShowLightbox(true)
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
                    <TouchableOpacity style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.card }]} onPress={uploadBannerImage}>
                        <ThemedIcon type="feather" name="image" size={20} color={theme.colors.mutedText} />
                        <ThemedText style={[styles.bannerPrompt, { color: theme.colors.mutedText }]}>Add a banner photo</ThemedText>
                    </TouchableOpacity>
                )}

                <View style={styles.profileWrapper}>
                    <TouchableOpacity
                        onPress={() => {
                            setLightboxImageUrl(profile.profile_url || '')
                            setShowLightbox(true)
                        }}
                        activeOpacity={0.8}
                        style={styles.avatarContainer}
                    >
                        <Image
                            source={{ uri: profile.profile_url || undefined }}
                            style={[styles.avatar, { borderColor: theme.colors.background }]}
                        />
                        <View style={[styles.avatarOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                            <ThemedIcon type="ionicons" name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.info}>
                        <ThemedText style={[styles.name, { color: theme.colors.text }]}>{name}</ThemedText>
                        {profile.headline ? (
                            <ThemedText style={[styles.headline, { color: theme.colors.mutedText }]}>{profile.headline}</ThemedText>
                        ) : null}
                    </View>
                </View>

                {/* Bio Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>About</ThemedText>
                        <TouchableOpacity 
                            style={[styles.editIconButton, { backgroundColor: theme.colors.card }]} 
                            activeOpacity={0.7}
                            onPress={() => (navigation as any).navigate('EditProfile', { focusBio: true })}
                        >
                            <ThemedIcon type="feather" name="edit-2" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.bioCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        {profile.bio ? (
                            <ThemedText style={[styles.bioText, { color: theme.colors.text }]}>{profile.bio}</ThemedText>
                        ) : (
                            <TouchableOpacity 
                                style={styles.addBioButton} 
                                activeOpacity={0.7}
                                onPress={() => (navigation as any).navigate('EditProfile', { focusBio: true })}
                            >
                                <ThemedIcon type="feather" name="plus" size={16} color={theme.colors.primary} />
                                <ThemedText style={[styles.addBioText, { color: theme.colors.primary }]}>Add a bio</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact</ThemedText>
                        <TouchableOpacity 
                            style={[styles.editIconButton, { backgroundColor: theme.colors.card }]} 
                            activeOpacity={0.7}
                            onPress={() => (navigation as any).navigate('EditProfile', { focusContact: true })}
                        >
                            <ThemedIcon type="feather" name="edit-2" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="mail-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                                <ThemedText style={[styles.contactLabel, { color: theme.colors.mutedText }]}>Email</ThemedText>
                                <ThemedText style={[styles.contactValue, { color: theme.colors.text }]}>{profile.email || user?.email || 'Not provided'}</ThemedText>
                            </View>
                        </View>
                        <View style={[styles.contactItem, { marginBottom: 0 }]}>
                            <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="call-outline" size={18} color={theme.colors.primary} />
                            </View>
                            <View style={styles.contactInfo}>
                                <ThemedText style={[styles.contactLabel, { color: theme.colors.mutedText }]}>Phone</ThemedText>
                                <ThemedText style={[styles.contactValue, { color: theme.colors.text }]}>{formatPhoneNumber(profile.phone)}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Friends Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Friends</ThemedText>
                        <TouchableOpacity style={[styles.seeAllButton, { backgroundColor: theme.colors.card }]} activeOpacity={0.7}>
                            <ThemedText style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.friendsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.friendsHeader}>
                            <View style={styles.friendCount}>
                                <ThemedText style={[styles.friendCountNumber, { color: theme.colors.primary }]}>12</ThemedText>
                                <ThemedText style={[styles.friendCountLabel, { color: theme.colors.mutedText }]}>Friends</ThemedText>
                            </View>
                            <TouchableOpacity style={[styles.addFriendButton, { backgroundColor: theme.colors.primary }]} activeOpacity={0.7}>
                                <ThemedIcon type="ionicons" name="person-add-outline" size={16} color="#fff" />
                                <ThemedText style={styles.addFriendText}>Add</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.recentFriends}>
                            <ThemedText style={[styles.recentFriendsTitle, { color: theme.colors.mutedText }]}>Recent</ThemedText>
                            <View style={styles.friendsList}>
                                <View style={styles.friendItem}>
                                    <View style={styles.friendAvatarContainer}>
                                        <Image 
                                            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
                                            style={styles.friendAvatar}
                                        />
                                        <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
                                    </View>
                                    <View style={styles.friendInfo}>
                                        <ThemedText style={[styles.friendName, { color: theme.colors.text }]}>Sarah Chen</ThemedText>
                                        <ThemedText style={[styles.friendStatus, { color: theme.colors.mutedText }]}>Online</ThemedText>
                                    </View>
                                </View>
                                <View style={styles.friendItem}>
                                    <View style={styles.friendAvatarContainer}>
                                        <Image 
                                            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
                                            style={styles.friendAvatar}
                                        />
                                    </View>
                                    <View style={styles.friendInfo}>
                                        <ThemedText style={[styles.friendName, { color: theme.colors.text }]}>Mike Johnson</ThemedText>
                                        <ThemedText style={[styles.friendStatus, { color: theme.colors.mutedText }]}>Last seen 2h ago</ThemedText>
                                    </View>
                                </View>
                                <View style={styles.friendItem}>
                                    <View style={styles.friendAvatarContainer}>
                                        <Image 
                                            source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }}
                                            style={styles.friendAvatar}
                                        />
                                    </View>
                                    <View style={styles.friendInfo}>
                                        <ThemedText style={[styles.friendName, { color: theme.colors.text }]}>Emma Davis</ThemedText>
                                        <ThemedText style={[styles.friendStatus, { color: theme.colors.mutedText }]}>Last seen 1d ago</ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</ThemedText>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.7}>
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="share-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={[styles.quickActionText, { color: theme.colors.text }]}>Share Profile</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.7}>
                            <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <ThemedIcon type="ionicons" name="qr-code-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <ThemedText style={[styles.quickActionText, { color: theme.colors.text }]}>QR Code</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Statistics */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Activity</ThemedText>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <ThemedText style={[styles.statNumber, { color: theme.colors.primary }]}>127</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: theme.colors.mutedText }]}>Messages</ThemedText>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <ThemedText style={[styles.statNumber, { color: theme.colors.primary }]}>12</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: theme.colors.mutedText }]}>Friends</ThemedText>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <ThemedText style={[styles.statNumber, { color: theme.colors.primary }]}>15</ThemedText>
                            <ThemedText style={[styles.statLabel, { color: theme.colors.mutedText }]}>Days Active</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Profile Picture Lightbox */}
            <ImageLightbox
                visible={showLightbox}
                onClose={() => setShowLightbox(false)}
                imageUrl={lightboxImageUrl}
            />
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
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        justifyContent: 'space-between',
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
    headerText: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 16,
    },

    editButton: {
        padding: 8,
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileWrapper: {
        marginTop: -49,
        paddingHorizontal: 24,
        alignItems: 'flex-start',
    },
    avatarContainer: {
        marginBottom: 8,
        position: 'relative',
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: '#fff',
    },
    info: {
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
    },
    address: {
        fontSize: 14,
        marginTop: 2,
    },
    headline: {
        fontSize: 14,
        marginTop: 4,
    },
    bannerWrapper: {
        width: '100%',
        height: 180,
        backgroundColor: '#ccc', // fallback color
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

    section: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
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
    addBioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    addBioText: {
        fontSize: 16,
        fontWeight: '500',
    },
    editIconButton: {
        padding: 6,
        borderRadius: 16,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    seeAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    friendAvatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2.5,
        borderColor: '#fff',
    },
    friendsCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    friendsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    friendCount: {
        alignItems: 'center',
    },
    friendCountNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 2,
    },
    friendCountLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    addFriendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    addFriendText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    recentFriends: {
        marginTop: 8,
    },
    recentFriendsTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    friendsList: {
        gap: 12,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    friendAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    friendStatus: {
        fontSize: 14,
        fontWeight: '400',
    },
    headerButton: {
        padding: 8,
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
