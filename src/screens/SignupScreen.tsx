import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import PasswordInput from '../components/PasswordInput'

export default function SignupScreen({ navigation }: any) {
  const { signUpWithEmail } = useAuth()

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

    // Get current user after signup
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const user = userData?.user
    if (userError || !user) throw new Error('User not found after signup.')

    // Confirm session and navigate
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <PasswordInput value={password} onChangeText={setPassword} />

      <TextInput
        style={styles.input}
        placeholder="Phone Number (Optional)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
})
