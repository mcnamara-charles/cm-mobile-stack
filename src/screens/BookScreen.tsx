import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText } from '../components/themed'
import { AppHeader } from '../components/themed/AppHeader'

export default function BookScreen() {
  const { theme } = useTheme()
  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader title="Book" />
      <View style={styles.center}>
        <ThemedText style={styles.text}>Book events coming soon!</ThemedText>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
}) 