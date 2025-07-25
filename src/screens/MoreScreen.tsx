import React, { useState } from 'react'
import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native'
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText, ThemedInputWrapper } from '../components/Themed'

type RootStackParamList = {
  Profile: undefined
  More: undefined
  Settings: undefined
  Help: undefined
  Preferences: undefined
  Legal: undefined
}

type Navigation = NativeStackNavigationProp<RootStackParamList>

const rawOptions: {
  key: string
  label: string
  Icon: React.ReactElement<{ color?: string; size?: number }>
  navigateTo: keyof RootStackParamList
}[] = [
  {
    key: 'profile',
    label: 'Profile',
    Icon: <Feather name="user" size={20} />,
    navigateTo: 'Profile',
  },
  {
    key: 'settings',
    label: 'Settings',
    Icon: <Feather name="settings" size={20} />,
    navigateTo: 'Settings',
  },
  {
    key: 'preferences',
    label: 'Preferences',
    Icon: <Ionicons name="options-outline" size={20} />,
    navigateTo: 'Preferences',
  },
  {
    key: 'help',
    label: 'Help Center',
    Icon: <Feather name="help-circle" size={20} />,
    navigateTo: 'Help',
  },
  {
    key: 'legal',
    label: 'Legal',
    Icon: <Feather name="file-text" size={20} />,
    navigateTo: 'Legal',
  },
]

export default function MoreScreen() {
  const navigation = useNavigation<Navigation>()
  const [search, setSearch] = useState('')
  const { theme } = useTheme()

  const options = rawOptions.map((item) => ({
    ...item,
    icon: React.cloneElement(item.Icon, { color: theme.colors.text }),
  }))

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>More</ThemedText>

      <ThemedInputWrapper style={{ marginBottom: 20 }}>
        <Feather
          name="search"
          size={16}
          color={theme.colors.mutedText}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.colors.mutedText}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </ThemedInputWrapper>

      <FlatList
        data={filteredOptions}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.optionRow, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate(item.navigateTo)}
          >
            <View style={styles.iconContainer}>{item.icon}</View>
            <ThemedText style={styles.optionLabel}>{item.label}</ThemedText>
            <AntDesign name="right" size={16} color={theme.colors.mutedText} style={styles.chevron} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
})
