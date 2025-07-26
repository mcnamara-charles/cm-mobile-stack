import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/themeContext'
import { supabase } from '../services/supabaseClient'

import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import MoreScreen from '../screens/MoreScreen'
import CompleteProfileScreen from '../screens/CompleteProfileScreen'
import ProfileScreen from '../screens/ProfileScreen'
import PreferencesScreen from '../screens/PreferencesScreen'
import SettingsScreen from '../screens/SettingsScreen'

import { Feather, MaterialIcons, Entypo } from '@expo/vector-icons'
import { ThemedIcon } from '../components/themed'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  const { theme } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 60,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
      }}
    >
      <Tab.Screen
        name="Home"
        component={WelcomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={WelcomeScreen} // Replace with InboxScreen when built
        options={{
          tabBarIcon: ({ color, size }) => <ThemedIcon type="ionicons" name="chatbubble-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={WelcomeScreen} // Replace with CalendarScreen when built
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-today" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="dots-three-horizontal" color={color} size={size - 2} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { user, loading } = useAuth()
  const { themeName, theme } = useTheme()
  const [profileIncomplete, setProfileIncomplete] = useState(false)

  // Extend from the default navigation themes
  const baseNavigationTheme = themeName === 'dark' ? DarkTheme : DefaultTheme

  const navigationTheme: Theme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
      primary: theme.colors.primary,
    },
  }

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, address, profile_url')
          .eq('id', user.id)
          .single()

        if (error || !data?.first_name || !data?.last_name || !data?.address || !data?.profile_url) {
          setProfileIncomplete(true)
        } else {
          setProfileIncomplete(false)
        }
      }
    }

    checkProfile()
  }, [user])

  if (loading) return null

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : profileIncomplete ? (
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Preferences"
              component={PreferencesScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
