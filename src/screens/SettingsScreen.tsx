import React from 'react'
import {
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native'
import { ThemedIcon } from '../components/themed'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../context/themeContext'
import { useAuth } from '../context/AuthContext'
import { ThemedView, ThemedText, ThemedTouchableOpacity } from '../components/themed'

export default function SettingsScreen() {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut()
          } catch (err: any) {
            Alert.alert('Error', err.message)
          }
        },
      },
    ])
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ThemedIcon type="ionicons" name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerText}>Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ThemedTouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.danger }]}
        onPress={handleSignOut}
      >
        <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
      </ThemedTouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
    marginLeft: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginTop: 24,
    marginHorizontal: 24,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
})
