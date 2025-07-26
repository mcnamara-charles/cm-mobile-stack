import { useState } from 'react'
import {
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import PasswordInput from '../components/PasswordInput'
import { useTheme } from '../context/themeContext'
import {
  ThemedView,
  ThemedText,
  ThemedInputWrapper,
  ThemedTouchableOpacity,
} from '../components/themed'

export default function SignupScreen({ navigation }: any) {
  const { signUpWithEmail } = useAuth()
  const { theme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Email and password are required.')
      return
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)
      await signUpWithEmail(email, password)

      const { data: userData, error: userError } = await supabase.auth.getUser()
      const user = userData?.user
      if (userError || !user) throw new Error('User not found after signup.')

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData?.session?.user) {
        navigation.replace('CompleteProfile')
      } else {
        Alert.alert('Success', 'Account created. Please log in.')
        navigation.navigate('Login')
      }
    } catch (err: any) {
      Alert.alert('Signup failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Create Account</ThemedText>

        <ThemedInputWrapper>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.mutedText}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </ThemedInputWrapper>

        <PasswordInput value={password} onChangeText={setPassword} />

        <ThemedInputWrapper>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Phone Number (Optional)"
            placeholderTextColor={theme.colors.mutedText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </ThemedInputWrapper>

        <ThemedTouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Creating...' : 'Sign Up'}
          </ThemedText>
        </ThemedTouchableOpacity>

        <ThemedTouchableOpacity onPress={() => navigation.navigate('Login')}>
          <ThemedText style={styles.link}>
            Already have an account? Log in
          </ThemedText>
        </ThemedTouchableOpacity>
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
})
