// WelcomeScreen.tsx (updated)
import { useEffect, useState } from 'react'
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { useNavigation } from '@react-navigation/native'
import { 
  ThemedView,
  ThemedText,
  ThemedImage,
  ThemedTouchableOpacity,
} from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function WelcomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const { theme } = useTheme()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('first_name, profile_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setFirstName(data.first_name)
        setProfileUrl(data.profile_url)
      }
      setLoading(false)
    }

    fetchUserData()
  }, [user])

  const today = format(new Date(), 'EEEE, MMM d')

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.root}>
      <ThemedView style={[styles.header, { borderColor: theme.colors.border }]}>
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.greeting}>Hi, {firstName || 'there'} 👋</ThemedText>
          <ThemedText style={styles.date}>{today}</ThemedText>
        </ThemedView>
        {profileUrl && (
          <ThemedTouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <ThemedImage source={{ uri: profileUrl }} style={styles.avatar} />
          </ThemedTouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.body}>
        <ThemedText style={styles.title}>Welcome to CM Mobile Stack</ThemedText>
      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
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
  userInfo: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
