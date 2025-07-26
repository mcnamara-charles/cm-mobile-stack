import React from 'react'
import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedIcon } from '../components/themed'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText } from '../components/themed'

export default function PreferencesScreen() {
  const navigation = useNavigation()
  const { themeName, theme, toggleTheme } = useTheme()
  const isDarkMode = themeName === 'dark'

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
        <ThemedText style={styles.headerText}>Preferences</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.row}>
        <ThemedText style={styles.label}>Dark Mode</ThemedText>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
  },
})
