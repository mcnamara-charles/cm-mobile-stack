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
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { SUPABASE_URL } from '../../config'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText } from '../components/Themed'

export default function ProfileScreen() {
    const navigation = useNavigation()
    const { user } = useAuth()
    const { theme } = useTheme()

    const [profile, setProfile] = useState<{
        first_name: string
        last_name: string
        profile_url: string
        address: string
        headline?: string
        banner_url?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            const { data, error } = await supabase
                .from('users')
                .select('first_name, last_name, profile_url, address, headline, banner_url')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
            setLoading(false)
        }

        fetchProfile()
    }, [user])

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
                throw new Error('Could not retrieve public URL')
            }

            const { error: updateError } = await supabase
                .from('users')
                .update({ banner_url: publicUrlData.publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            setProfile(prev => prev ? { ...prev, banner_url: publicUrlData.publicUrl } : prev)
        } catch (err: any) {
            Alert.alert('Banner Upload Failed', err.message || 'Try again later.')
        }
    }

    if (!user) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ThemedText style={{ color: theme.colors.mutedText }}>You're not logged in.</ThemedText>
            </ThemedView>
        )
    }

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.mutedText} />
            </ThemedView>
        )
    }

    if (!profile) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ThemedText style={{ color: theme.colors.mutedText }}>No profile found.</ThemedText>
            </ThemedView>
        )
    }

    const name = `${profile.first_name} ${profile.last_name[0]}.`

    return (
        <ScrollView style={[styles.root, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <ThemedView>
                <View style={[styles.header, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>{name}</ThemedText>
                    <TouchableOpacity>
                        <Feather name="edit-2" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {profile.banner_url ? (
                    <View style={styles.bannerWrapper}>
                        <Image
                            source={{ uri: profile.banner_url }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                            onError={(e) => console.warn('Banner image load error:', e.nativeEvent.error)}
                        />
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.card }]} onPress={uploadBannerImage}>
                        <Feather name="image" size={20} color={theme.colors.mutedText} />
                        <ThemedText style={[styles.bannerPrompt, { color: theme.colors.mutedText }]}>Add a banner photo</ThemedText>
                    </TouchableOpacity>
                )}

                <View style={styles.profileWrapper}>
                    <Image
                        source={{ uri: profile.profile_url }}
                        style={[styles.avatar, { borderColor: theme.colors.background }]}
                    />
                    <View style={styles.info}>
                        <ThemedText style={[styles.name, { color: theme.colors.text }]}>{name}</ThemedText>
                        <ThemedText style={[styles.address, { color: theme.colors.mutedText }]}>{profile.address}</ThemedText>
                        {profile.headline ? (
                            <ThemedText style={[styles.headline, { color: theme.colors.mutedText }]}>{profile.headline}</ThemedText>
                        ) : null}
                    </View>
                </View>
            </ThemedView>
        </ScrollView>
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
    profileWrapper: {
        marginTop: -49,
        paddingHorizontal: 24,
        alignItems: 'flex-start',
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 8,
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
})
