// WelcomeScreen.tsx (updated)
import { useEffect, useState } from 'react'
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
  View,
  TouchableOpacity,
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
import { useRefreshableScroll } from '../hooks/useRefreshableScroll'

export default function WelcomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const { theme } = useTheme()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  const { refreshControl } = useRefreshableScroll(fetchUserData)

  useEffect(() => {
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
    <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
          <View style={styles.headerRow}>
            <View style={styles.greetingBlock}>
              <ThemedText style={[styles.greeting, { color: theme.colors.text }]}>Hi, {firstName || 'there'} 👋</ThemedText>
              <ThemedText style={[styles.date, { color: theme.colors.mutedText }]}>{today}</ThemedText>
            </View>
            {profileUrl && (
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <ThemedImage source={{ uri: profileUrl }} style={styles.avatar} cacheKey={profileUrl} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
            <ThemedText style={[styles.cardTitle, { color: theme.colors.text }]}>Welcome to CM Mobile Stack</ThemedText>
            <ThemedText style={[styles.cardSubtitle, { color: theme.colors.mutedText }]}>Your productivity hub</ThemedText>
            <View style={styles.quickLinksRow}>
              <TouchableOpacity style={[styles.quickLink, { backgroundColor: theme.colors.primary + '22' }]} onPress={() => navigation.navigate('Inbox')}>
                <ThemedText style={[styles.quickLinkText, { color: theme.colors.primary }]}>Inbox</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickLink, { backgroundColor: theme.colors.primary + '22' }]} onPress={() => navigation.navigate('Calendar')}>
                <ThemedText style={[styles.quickLinkText, { color: theme.colors.primary }]}>Calendar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickLink, { backgroundColor: theme.colors.primary + '22' }]} onPress={() => navigation.navigate('Profile')}>
                <ThemedText style={[styles.quickLinkText, { color: theme.colors.primary }]}>Profile</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>Today</ThemedText>
            <ThemedText style={[styles.sectionText, { color: theme.colors.text }]}>No events scheduled. Enjoy your day!</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingBlock: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
    marginTop: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#eee',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  quickLink: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
  },
  quickLinkText: {
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    width: '100%',
    marginTop: 24,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
