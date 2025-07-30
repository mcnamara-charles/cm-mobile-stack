import React from 'react'
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedIcon, ThemedText, ThemedImage } from './themed'
import { useTheme } from '../context/themeContext'
import { User } from '../types/global'
import { RootStackNavigationProp } from '../types/navigation'

interface MessageThreadHeaderProps {
  otherUser: User | null
  loading?: boolean
}

export default function MessageThreadHeader({ otherUser, loading = false }: MessageThreadHeaderProps) {
  const navigation = useNavigation()
  const { theme } = useTheme()

  if (loading) {
    return (
      <View style={[styles.header, {
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.border
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <ThemedIcon
            type="ionicons"
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          <View style={[styles.headerAvatar, { 
            backgroundColor: theme.colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center'
          }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={[styles.loadingName, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.loadingEmail, { backgroundColor: theme.colors.border }]} />
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>
    )
  }

  return (
    <View style={[styles.header, {
      backgroundColor: theme.colors.card,
      borderBottomColor: theme.colors.border
    }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
        <ThemedIcon
          type="ionicons"
          name="arrow-back"
          size={24}
          color={theme.colors.text}
        />
      </TouchableOpacity>
      {otherUser && (
        <View style={styles.headerUserInfo}>
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to user profile
              console.log('Navigate to user profile:', otherUser.id)
            }}
            activeOpacity={0.7}
          >
            {otherUser.profile_url ? (
              <ThemedImage 
                source={{ uri: otherUser.profile_url }} 
                style={styles.headerAvatar} 
                cacheKey={otherUser.profile_url} 
              />
            ) : (
              <View style={[styles.headerAvatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  {otherUser.first_name?.[0] || 'U'}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <ThemedText style={[styles.headerName, { color: theme.colors.text }]}>
              {otherUser.first_name} {otherUser.last_name}
            </ThemedText>
            <ThemedText style={[styles.headerEmail, { color: theme.colors.mutedText }]}>
              {otherUser.email}
            </ThemedText>
          </View>
        </View>
      )}
      <View style={{ width: 24 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  headerBack: { 
    padding: 4, 
    marginRight: 8 
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerEmail: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  headerAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#eee' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  loadingName: {
    height: 16,
    width: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  loadingEmail: {
    height: 12,
    width: 80,
    borderRadius: 6,
  },
}) 