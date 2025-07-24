import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { useNavigation } from '@react-navigation/native' // ✅

export default function WelcomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<any>() // ✅
  const [firstName, setFirstName] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('users')
        .select('first_name, profile_url')
        .eq('id', user.id)
        .single()

      if (!error && data) {
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hi, {firstName || 'there'} 👋</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        {profileUrl && (
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {<Image source={{ uri: profileUrl }} style={styles.avatar} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title}>Welcome to CM Mobile Stack</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
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
    color: '#222',
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#ccc',
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
    color: '#111',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
