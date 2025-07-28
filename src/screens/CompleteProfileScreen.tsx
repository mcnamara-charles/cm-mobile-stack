import React, { useState } from 'react'
import {
  TextInput,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Text,
} from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { SUPABASE_URL } from '../../config'
import { useTheme } from '../context/themeContext'
import {
  ThemedView,
  ThemedText,
  ThemedIcon,
} from '../components/themed'
import { AppHeader } from '../components/themed/AppHeader'

function FloatingInput({
  label, value, onChangeText, icon, keyboardType, autoCapitalize, secureTextEntry, style, showIcon = true, ...props
}: any) {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const animated = React.useRef(new Animated.Value(value ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(animated, {
      toValue: isFocused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }, [isFocused, value])

  // Label animates above the input only when focused or filled
  const labelTopFloated = -22
  const labelTopUnfloated = 15
  const labelLeft = 16 // Always left-aligned, regardless of icon
  const labelContainerStyle = {
    position: 'absolute' as const,
    left: labelLeft,
    top: animated.interpolate({ inputRange: [0, 1], outputRange: [labelTopUnfloated, labelTopFloated] }),
    zIndex: 2,
    paddingHorizontal: 0,
    justifyContent: 'flex-start' as const,
  }
  const labelTextStyle = {
    fontSize: animated.interpolate({ inputRange: [0, 1], outputRange: [16, 13] }),
    color: animated.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.mutedText, theme.colors.primary] }),
    lineHeight: 18,
    fontWeight: '400' as const,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  }
  return (
    <View style={[styles.floatingInputContainer, style]}> 
      {showIcon && (
        <View style={styles.floatingInputIconWrap}>
          <ThemedIcon type="ionicons" name={icon} size={20} color={theme.colors.mutedText} />
        </View>
      )}
      {(isFocused || value) && (
        <Animated.View style={labelContainerStyle} pointerEvents="none">
          <Animated.Text style={labelTextStyle}>{label}</Animated.Text>
        </Animated.View>
      )}
      <TextInput
        style={[
          styles.floatingInput,
          {
            backgroundColor: theme.colors.input,
            color: theme.colors.text,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            paddingLeft: showIcon ? 48 : 16, // Adjust padding based on icon presence
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        placeholder={isFocused || value ? '' : label}
        placeholderTextColor={theme.colors.mutedText}
        {...props}
      />
    </View>
  )
}

export default function CompleteProfileScreen({ navigation }: any) {
  const { user, ensureValidUser, signOut } = useAuth()
  const { theme } = useTheme()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [profileUri, setProfileUri] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(true)
  const [isProvider, setIsProvider] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Animated values for segmented control
  const clientAnimated = React.useRef(new Animated.Value(0)).current
  const providerAnimated = React.useRef(new Animated.Value(0)).current

  // Update animations when selection changes
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(clientAnimated, {
        toValue: isClient ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(providerAnimated, {
        toValue: isProvider ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start()
  }, [isClient, isProvider])

  const pickImage = async () => {
    setUploading(true)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    setUploading(false)
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
      return publicUrlData.publicUrl
    } catch (err: any) {
      console.error('❌ Upload error:', err)
      throw new Error(err?.message || 'Image upload failed')
    }
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.')
      return
    }

    if (!isClient && !isProvider) {
      Alert.alert('Error', 'Please select at least one role (Client or Provider).')
      return
    }

    if (!profileUri) {
      Alert.alert('Error', 'Please select a profile picture.')
      return
    }

    setLoading(true)
    try {
      const imageUrl = await uploadProfileImage(profileUri, user!.id)
      const { error } = await supabase
        .from('users')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address: address.trim(),
          is_client: isClient,
          is_provider: isProvider,
          profile_url: imageUrl,
        })
        .eq('id', user!.id)

      if (error) throw error

      // Update local profile
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (updatedProfile) {
        // setProfile(updatedProfile) // This line was not in the original file, so it's removed.
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      Alert.alert('Error', 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader title="Complete Profile" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Floating avatar */}
          <View style={styles.avatarRow}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
              accessibilityRole="button"
              accessibilityLabel="Choose profile picture"
              activeOpacity={0.8}
            >
              <View style={styles.avatarShadow}>
                {profileUri ? (
                  <Image source={{ uri: profileUri }} style={[styles.avatar, { borderColor: theme.colors.primary }]} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}> 
                    <ThemedIcon type="ionicons" name="person" size={48} color={theme.colors.mutedText} />
                  </View>
                )}
                <View style={[styles.cameraOverlay, { backgroundColor: theme.colors.primary }]}>
                  {uploading ? (
                    <ActivityIndicator color="#fff" size={18} />
                  ) : (
                    <ThemedIcon type="ionicons" name="camera" size={18} color="#fff" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Welcome! Let’s get you set up</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.colors.mutedText }]}>Add your details to complete your profile</ThemedText>
          {/* Inputs */}
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <FloatingInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  showIcon={false}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputCol}>
                <FloatingInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  showIcon={false}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.inputRowFull}>
              <FloatingInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                icon="location-outline"
                showIcon={true}
                autoCapitalize="sentences"
              />
            </View>
          </View>
          {/* Segmented role toggle */}
          <ThemedText style={[styles.roleLabel, { color: theme.colors.text }]}>I'm using this app as a:</ThemedText>
          <View style={[styles.segmentedControl, { borderColor: theme.colors.border, backgroundColor: theme.colors.input }]}> 
            <Animated.View
              style={[
                styles.segmentedSegment,
                {
                  backgroundColor: clientAnimated.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['transparent', theme.colors.primary]
                  }),
                  transform: [{
                    scale: clientAnimated.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02]
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.segmentedTouchable}
                onPress={() => setIsClient((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel="Toggle client role"
                activeOpacity={0.85}
              >
                <Animated.View style={{ opacity: 1 }}>
                  <ThemedIcon 
                    type="ionicons" 
                    name="person" 
                    size={18} 
                    color={isClient ? '#fff' : theme.colors.primary} 
                  />
                </Animated.View>
                <Animated.Text 
                  style={[
                    styles.segmentedText, 
                    { 
                      color: isClient ? '#fff' : theme.colors.primary
                    }
                  ]}
                >
                  Client
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View
              style={[
                styles.segmentedSegment,
                {
                  backgroundColor: providerAnimated.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['transparent', theme.colors.primary]
                  }),
                  transform: [{
                    scale: providerAnimated.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02]
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.segmentedTouchable}
                onPress={() => setIsProvider((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel="Toggle provider role"
                activeOpacity={0.85}
              >
                <Animated.View style={{ opacity: 1 }}>
                  <ThemedIcon 
                    type="ionicons" 
                    name="briefcase" 
                    size={18} 
                    color={isProvider ? '#fff' : theme.colors.primary} 
                  />
                </Animated.View>
                <Animated.Text 
                  style={[
                    styles.segmentedText, 
                    { 
                      color: isProvider ? '#fff' : theme.colors.primary
                    }
                  ]}
                >
                  Provider
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          {/* Continue button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },
  avatarRow: {
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 64,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 8,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  inputCol: {
    flex: 1,
  },
  inputRowFull: {
    marginTop: 12,
    marginBottom: 0,
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  inputUnderline: {
    borderBottomWidth: 1.5,
    borderRadius: 0,
  },
  roleLabel: {
    fontSize: 15,
    marginTop: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  segmentedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: 'transparent',
    marginRight: 0,
  },
  segmentedText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 0,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  floatingInputContainer: {
    marginBottom: 18,
    position: 'relative',
    justifyContent: 'center',
    minHeight: 52,
  },
  floatingInputIconWrap: {
    position: 'absolute',
    left: 16,
    top: 14, // better vertical alignment
    zIndex: 2,
    height: 24,
    justifyContent: 'center',
  },
  floatingInput: {
    height: 52,
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    borderWidth: 1,
    lineHeight: 22,
    paddingTop: Platform.OS === 'ios' ? 14 : 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    textAlignVertical: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 4,
  },
  segmentedSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(0,0,0,0.08)',
  },
  segmentedTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
})
