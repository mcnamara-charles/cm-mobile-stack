import { useState } from 'react'
import {
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import { useTheme } from '../context/themeContext'
import {
  ThemedView,
  ThemedText,
  ThemedInputWrapper,
  ThemedTouchableOpacity,
} from '../components/Themed'

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail } = useAuth()
  const { theme } = useTheme()

  const handleLogin = async () => {
    try {
      setLoading(true)
      await signInWithEmail(email, password)
    } catch (err: any) {
      Alert.alert('Login failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Log In</ThemedText>

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

      <ThemedTouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.colors.primary },
          loading && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </ThemedText>
      </ThemedTouchableOpacity>

      <ThemedTouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <ThemedText style={styles.link}>
          Don't have an account? Sign up
        </ThemedText>
      </ThemedTouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
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
