import { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { SUPABASE_URL } from '../../config'

export default function ProfileScreen() {
    const navigation = useNavigation()
    const { user } = useAuth()

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: '#888' }}>You're not logged in.</Text>
            </View>
        )
    }

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
            if (!user) {
                console.log("User no")
                return
            }
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
                console.error('❌ Upload failed response:', uploadResponse)
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        )
    }

    if (!profile) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: '#888' }}>No profile found.</Text>
            </View>
        )
    }

    const name = `${profile.first_name} ${profile.last_name[0]}.`

    return (
        <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
            <View collapsable={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>{name}</Text>
                    <TouchableOpacity>
                        <Feather name="edit-2" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Banner */}
                {profile.banner_url ? (
                    <Image source={{ uri: profile.banner_url }} style={styles.banner} />
                ) : (
                    <TouchableOpacity style={styles.bannerPlaceholder} onPress={uploadBannerImage}>
                        <Feather name="image" size={20} color="#999" />
                        <Text style={styles.bannerPrompt}>Add a banner photo</Text>
                    </TouchableOpacity>
                )}

                {/* Avatar and Info */}
                <View style={styles.profileWrapper}>
                    <Image source={{ uri: profile.profile_url }} style={styles.avatar} />
                    <View style={styles.info}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.address}>{profile.address}</Text>
                        {profile.headline ? (
                            <Text style={styles.headline}>{profile.headline}</Text>
                        ) : null}
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
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
        color: '#222',
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
        color: '#222',
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    headline: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    },
    banner: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    bannerPlaceholder: {
        height: 180,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    bannerPrompt: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
})
