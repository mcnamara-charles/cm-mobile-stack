import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

// Define your valid routes
type RootStackParamList = {
  Profile: undefined
  More: undefined
  Settings: undefined
  Help: undefined
  Preferences: undefined
  Legal: undefined
}

type Navigation = NativeStackNavigationProp<RootStackParamList>

const options: {
  key: string
  label: string
  icon: React.ReactNode
  navigateTo: keyof RootStackParamList
}[] = [
  {
    key: 'profile',
    label: 'Profile',
    icon: <Feather name="user" size={20} color="#333" />,
    navigateTo: 'Profile',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Feather name="settings" size={20} color="#333" />,
    navigateTo: 'Settings',
  },
  {
    key: 'preferences',
    label: 'Preferences',
    icon: <Ionicons name="options-outline" size={20} color="#333" />,
    navigateTo: 'Preferences',
  },
  {
    key: 'help',
    label: 'Help Center',
    icon: <Feather name="help-circle" size={20} color="#333" />,
    navigateTo: 'Help',
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: <Feather name="file-text" size={20} color="#333" />,
    navigateTo: 'Legal',
  }
]

export default function MoreScreen() {
  const navigation = useNavigation<Navigation>()
  const [search, setSearch] = useState('')

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>More</Text>

      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#777" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredOptions}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => navigation.navigate(item.navigateTo)}
          >
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.optionLabel}>{item.label}</Text>
            <AntDesign name="right" size={16} color="#999" style={styles.chevron} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
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
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
})
