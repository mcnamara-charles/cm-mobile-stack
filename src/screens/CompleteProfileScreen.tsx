import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { SUPABASE_URL } from '../../config'

export default function CompleteProfileScreen({ navigation }: any) {
    const { user, ensureValidUser, signOut } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [address, setAddress] = useState('')
    const [profileUri, setProfileUri] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        })

        if (!result.canceled && result.assets.length > 0) {
            setProfileUri(result.assets[0].uri)
        }
    }

    const uploadProfileImage = async (uri: string, userId: string): Promise<string> => {
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    )

    const fileName = `${userId}.jpeg`
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/profile-pictures/${fileName}`

    console.log("Uploading with URL: " + uploadUrl)

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
        throw new Error(
            `Upload failed with status ${uploadResponse.status}: ${uploadResponse.body}`
        )
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    if (!publicUrlData?.publicUrl) {
      throw new Error('Could not retrieve public URL')
    }

    return publicUrlData.publicUrl
  } catch (err: any) {
    console.error('❌ Upload error:', err)
    throw new Error(err?.message || 'Image upload failed')
  }
}

    const handleSave = async () => {
        const validUser = await ensureValidUser()

        if (!validUser) {
            Alert.alert('Session Expired', 'You’ve been logged out.')
            await signOut()
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
            return
        }

        if (!firstName || !lastName || !address || !profileUri) {
            Alert.alert('Missing Info', 'Please fill out all fields including your photo.')
            return
        }

        setLoading(true)

        try {
            const publicUrl = await uploadProfileImage(profileUri, validUser.id)

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    address,
                    profile_url: publicUrl,
                })
                .eq('id', validUser.id)

            if (updateError) throw updateError
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Something went wrong saving your profile.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Complete Your Profile</Text>

                <TouchableOpacity
                    onPress={pickImage}
                    style={styles.avatarContainer}
                    accessibilityRole="button"
                    accessibilityLabel="Choose profile picture"
                >
                    {profileUri ? (
                        <Image source={{ uri: profileUri }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholderBox}>
                            <Text style={styles.avatarPlaceholder}>Choose Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    accessibilityLabel="First Name"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    accessibilityLabel="Last Name"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Address"
                    value={address}
                    onChangeText={setAddress}
                    autoCapitalize="sentences"
                    accessibilityLabel="Address"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Save profile"
                >
                    <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Continue'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32,
        color: '#111',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    button: {
        backgroundColor: '#111',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    avatarPlaceholderBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        color: '#666',
        fontSize: 14,
    },
})
