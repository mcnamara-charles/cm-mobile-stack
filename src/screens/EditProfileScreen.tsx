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
    Modal,
    Pressable,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import React from 'react'
import { ThemedIcon } from '../components/themed'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { updateUserProfile } from '../services/api/users'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { SUPABASE_URL } from '../../config'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText } from '../components/themed'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function EditProfileScreen() {
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
        bio?: string
        email?: string
        phone?: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showLightbox, setShowLightbox] = useState(false)
    const [lightboxImageError, setLightboxImageError] = useState(false)
    const [lightboxImageUrl, setLightboxImageUrl] = useState<string>('')
    const [lightboxImageType, setLightboxImageType] = useState<'profile' | 'banner'>('profile')

    // Add state for selected profile and banner image URIs
    const [selectedProfileImageUri, setSelectedProfileImageUri] = useState<string | null>(null)
    const [selectedBannerImageUri, setSelectedBannerImageUri] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        address: '',
        headline: '',
        bio: '',
        phone: '',
    })
    const [originalData, setOriginalData] = useState({
        first_name: '',
        last_name: '',
        address: '',
        headline: '',
        bio: '',
        phone: '',
    })

    useFocusEffect(
        React.useCallback(() => {
            const fetchProfile = async () => {
                if (!user) return
                const { data, error } = await supabase
                    .from('users')
                    .select('first_name, last_name, profile_url, address, headline, banner_url, email, phone, bio')
                    .eq('id', user.id)
                    .single()
                if (error) {
                    console.error('Error fetching profile:', error)
                } else {
                    setProfile(data)
                    const initialFormData = {
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        address: data.address || '',
                        headline: data.headline || '',
                        bio: data.bio || '',
                        phone: data.phone || '',
                    }
                    setFormData(initialFormData)
                    setOriginalData(initialFormData)
                }
                setLoading(false)
            }
            fetchProfile()
        }, [user])
    )

    const uploadProfileImage = async () => {
        if (!user) return
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            })

            if (result.canceled || !result.assets?.[0]?.uri) return

            setSelectedProfileImageUri(result.assets[0].uri)
            setProfile(prev => prev ? { ...prev, profile_url: result.assets[0].uri } : null)
        } catch (error) {
            console.error('Error selecting profile image:', error)
            Alert.alert('Error', 'Failed to select profile image')
        }
    }

    const uploadProfileImageToStorage = async (uri: string, userId: string): Promise<string> => {
        try {
            const manipulated = await ImageManipulator.manipulateAsync(
                uri,
                [],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            )

            const fileName = `${userId}.jpeg`
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
                throw new Error(`Upload failed with status ${uploadResponse.status}: ${uploadResponse.body}`)
            }

            const { data: publicUrlData } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName)

            if (!publicUrlData?.publicUrl) {
                throw new Error('Could not retrieve public URL')
            }

            return `${publicUrlData.publicUrl}?v=${Date.now()}`
        } catch (err: any) {
            console.error('❌ Upload error:', err)
            throw new Error(err?.message || 'Image upload failed')
        }
    }

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

            setSelectedBannerImageUri(result.assets[0].uri)
            setProfile(prev => prev ? { ...prev, banner_url: result.assets[0].uri } : null)
        } catch (error) {
            console.error('Error selecting banner image:', error)
            Alert.alert('Error', 'Failed to select banner image')
        }
    }

    const uploadBannerImageToStorage = async (uri: string, userId: string): Promise<string> => {
        try {
            const manipulated = await ImageManipulator.manipulateAsync(
                uri,
                [],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            )

            const fileName = `${userId}-banner.jpeg`
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
                throw new Error(`Upload failed with status ${uploadResponse.status}: ${uploadResponse.body}`)
            }

            const { data: publicUrlData } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName)

            if (!publicUrlData?.publicUrl) {
                throw new Error('Could not retrieve public URL')
            }

            return `${publicUrlData.publicUrl}?v=${Date.now()}`
        } catch (err: any) {
            console.error('❌ Upload error:', err)
            throw new Error(err?.message || 'Image upload failed')
        }
    }

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        try {
            let publicProfileUrl = null
            let publicBannerUrl = null
            if (selectedProfileImageUri) {
                publicProfileUrl = await uploadProfileImageToStorage(selectedProfileImageUri, user.id)
            }
            if (selectedBannerImageUri) {
                publicBannerUrl = await uploadBannerImageToStorage(selectedBannerImageUri, user.id)
            }
            const result = await updateUserProfile({
                userId: user.id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                address: formData.address,
                headline: formData.headline,
                bio: formData.bio,
                phone: formData.phone,
                ...(publicProfileUrl ? { profile_url: publicProfileUrl } : {}),
                ...(publicBannerUrl ? { banner_url: publicBannerUrl } : {}),
            })
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to update profile')
            }
            // Fetch updated profile from Supabase
            const { data: updatedProfile, error } = await supabase
                .from('users')
                .select('first_name, last_name, profile_url, address, headline, banner_url, email, phone, bio')
                .eq('id', user.id)
                .single()
            if (!error && updatedProfile) {
                setProfile(updatedProfile)
            }
            // Clear local image URIs
            setSelectedProfileImageUri(null)
            setSelectedBannerImageUri(null)
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ])
        } catch (error) {
            console.error('Error updating profile:', error)
            Alert.alert('Error', 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const hasChanges = () => {
        return (
            formData.first_name !== originalData.first_name ||
            formData.last_name !== originalData.last_name ||
            formData.address !== originalData.address ||
            formData.headline !== originalData.headline ||
            formData.bio !== originalData.bio ||
            formData.phone !== originalData.phone ||
            selectedProfileImageUri !== null ||
            selectedBannerImageUri !== null
        )
    }

    const handleCancel = () => {
        if (hasChanges()) {
            Alert.alert(
                'Discard Changes?',
                'Are you sure you want to discard your changes?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            )
        } else {
            navigation.goBack()
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

    const name = `${formData.first_name} ${formData.last_name}`

    return (
        <ThemedView style={[styles.root, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={[styles.header, {
                        backgroundColor: theme.colors.background,
                        borderBottomColor: theme.colors.border
                    }]}>
                        <TouchableOpacity 
                            onPress={handleCancel}
                            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
                            activeOpacity={0.7}
                        >
                            <ThemedIcon 
                                type="ionicons" 
                                name="close" 
                                size={20} 
                                color={theme.colors.text} 
                            />
                        </TouchableOpacity>
                        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Edit Profile</ThemedText>
                        <TouchableOpacity 
                            style={[
                                styles.saveButton, 
                                { 
                                    backgroundColor: hasChanges() ? theme.colors.primary : theme.colors.mutedText + '40',
                                }
                            ]} 
                            activeOpacity={0.7}
                            onPress={handleSave}
                            disabled={saving || !hasChanges()}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <ThemedText style={[
                                    styles.saveButtonText,
                                    { color: hasChanges() ? '#fff' : theme.colors.mutedText }
                                ]}>
                                    Save
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>

                                    {/* Banner */}
                <TouchableOpacity
                    onPress={uploadBannerImage}
                    activeOpacity={0.9}
                    style={styles.bannerWrapper}
                    accessibilityRole="button"
                    accessibilityLabel="Change banner photo"
                >
                    {(selectedBannerImageUri || profile.banner_url) ? (
                        <Image
                            source={{ uri: selectedBannerImageUri || profile.banner_url }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                            onError={(e) => console.warn('Banner image load error:', e.nativeEvent.error)}
                        />
                    ) : (
                        <View style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.card }]}> 
                            <ThemedIcon type="feather" name="image" size={24} color={theme.colors.mutedText} />
                            <ThemedText style={[styles.bannerPrompt, { color: theme.colors.mutedText }]}>Add a banner photo</ThemedText>
                        </View>
                    )}
                    <View style={[styles.bannerOverlay, { backgroundColor: 'rgba(0,0,0,0.15)' }]}> 
                        <View style={[styles.editOverlay, { backgroundColor: theme.colors.primary }]}> 
                            <ThemedIcon type="ionicons" name="camera" size={18} color="#fff" />
                            <ThemedText style={styles.editOverlayText}>Tap to change</ThemedText>
                        </View>
                        <View style={styles.editIndicator}> 
                            <ThemedIcon type="ionicons" name="pencil" size={12} color={theme.colors.primary} />
                        </View>
                    </View>
                </TouchableOpacity>

                    {/* Profile Info */}
                    <View style={styles.profileWrapper}>
                        <TouchableOpacity
                            onPress={uploadProfileImage}
                            activeOpacity={0.9}
                            style={styles.avatarContainer}
                            accessibilityRole="button"
                            accessibilityLabel="Change profile photo"
                        >
                            <Image
                                source={{ uri: selectedProfileImageUri || profile.profile_url }}
                                style={[styles.avatar, { borderColor: theme.colors.background }]}
                            />
                            <View style={[styles.avatarOverlay, { backgroundColor: 'rgba(0,0,0,0.15)' }]}> 
                                <View style={[styles.editOverlay, { backgroundColor: theme.colors.primary }]}> 
                                    <ThemedIcon type="ionicons" name="camera" size={14} color="#fff" />
                                    <ThemedText style={styles.editOverlayText}>Tap to change</ThemedText>
                                </View>
                                <View style={styles.editIndicator}> 
                                    <ThemedIcon type="ionicons" name="pencil" size={10} color={theme.colors.primary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.info}>
                            <ThemedText style={[styles.name, { color: theme.colors.text }]}>{name}</ThemedText>
                            <ThemedText style={[styles.address, { color: theme.colors.mutedText }]}>{formData.address}</ThemedText>
                            {formData.headline ? (
                                <ThemedText style={[styles.headline, { color: theme.colors.mutedText }]}>{formData.headline}</ThemedText>
                            ) : null}
                        </View>
                    </View>

                    {/* Basic Information */}
                    <View style={[styles.section, styles.majorSection]}>
                        <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</ThemedText>
                        
                        <View style={styles.fieldGroup}>
                            <View style={styles.fieldRow}>
                                <View style={styles.fieldContainer}>
                                    <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>First Name</ThemedText>
                                    <TextInput
                                        style={[styles.modernInput, { 
                                            color: theme.colors.text, 
                                            backgroundColor: theme.colors.card 
                                        }]}
                                        value={formData.first_name}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
                                        placeholder="Enter first name"
                                        placeholderTextColor={theme.colors.mutedText}
                                    />
                                </View>
                                <View style={styles.fieldSpacer} />
                                <View style={styles.fieldContainer}>
                                    <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>Last Name</ThemedText>
                                    <TextInput
                                        style={[styles.modernInput, { 
                                            color: theme.colors.text, 
                                            backgroundColor: theme.colors.card 
                                        }]}
                                        value={formData.last_name}
                                        onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
                                        placeholder="Enter last name"
                                        placeholderTextColor={theme.colors.mutedText}
                                    />
                                </View>
                            </View>
                            
                            <View style={styles.fieldContainer}>
                                <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>Address</ThemedText>
                                <TextInput
                                    style={[styles.modernInput, { 
                                        color: theme.colors.text, 
                                        backgroundColor: theme.colors.card 
                                    }]}
                                    value={formData.address}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                    placeholder="Enter your address"
                                    placeholderTextColor={theme.colors.mutedText}
                                />
                            </View>
                            
                            <View style={styles.fieldContainer}>
                                <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>Headline</ThemedText>
                                <TextInput
                                    style={[styles.modernInput, { 
                                        color: theme.colors.text, 
                                        backgroundColor: theme.colors.card 
                                    }]}
                                    value={formData.headline}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, headline: text }))}
                                    placeholder="Add a headline"
                                    placeholderTextColor={theme.colors.mutedText}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={[styles.section, styles.majorSection]}>
                        <View style={styles.fieldGroup}>
                            <View style={styles.fieldContainer}>
                                <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>Bio</ThemedText>
                                <TextInput
                                    style={[styles.modernTextArea, { 
                                        color: theme.colors.text, 
                                        backgroundColor: theme.colors.card 
                                    }]}
                                    value={formData.bio}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                                    placeholder="Tell us about yourself..."
                                    placeholderTextColor={theme.colors.mutedText}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Contact Information */}
                    <View style={[styles.section, styles.majorSection]}>
                        <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact</ThemedText>
                        
                        <View style={styles.fieldGroup}>
                            <View style={styles.fieldContainer}>
                                <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>Email</ThemedText>
                                <View style={[styles.readOnlyField, { backgroundColor: theme.colors.card }]}>
                                    <TextInput
                                        style={[styles.modernInputReadOnly, { 
                                            color: theme.colors.mutedText, 
                                            backgroundColor: 'transparent' 
                                        }]}
                                        value={profile.email || user?.email || ''}
                                        editable={false}
                                        placeholder="Email"
                                        placeholderTextColor={theme.colors.mutedText}
                                    />
                                    <ThemedIcon type="ionicons" name="lock-closed" size={16} color={theme.colors.mutedText} />
                                </View>
                                <ThemedText style={[styles.fieldNote, { color: theme.colors.mutedText }]}>Email cannot be changed</ThemedText>
                            </View>
                            
                            <View style={styles.fieldContainer}>
                                <ThemedText style={[styles.fieldLabel, { color: theme.colors.mutedText }]}>Phone</ThemedText>
                                <TextInput
                                    style={[styles.modernInput, { 
                                        color: theme.colors.text, 
                                        backgroundColor: theme.colors.card 
                                    }]}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={theme.colors.mutedText}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

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
                                key={`lightbox-${lightboxImageUrl}`}
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
        paddingBottom: 16,
        paddingHorizontal: 20,
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
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    profileWrapper: {
        marginTop: -49,
        paddingHorizontal: 20,
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
        backgroundColor: '#ccc',
        overflow: 'hidden',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
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
        paddingHorizontal: 16,
        marginTop: 16,
    },
    majorSection: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    fieldGroup: {
        gap: 16,
    },
    fieldRow: {
        flexDirection: 'row',
        gap: 12,
    },
    fieldSpacer: {
        width: 12,
    },
    fieldContainer: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    fieldNote: {
        fontSize: 13,
        marginTop: 6,
        fontStyle: 'italic',
        opacity: 0.7,
    },
    modernInput: {
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    modernInputReadOnly: {
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        opacity: 0.7,
    },
    readOnlyField: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    modernTextArea: {
        height: 120,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: '500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    editOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    editOverlayText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    editIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
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
}) 