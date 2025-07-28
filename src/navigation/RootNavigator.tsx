import React from 'react'
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
import InboxScreen from '../screens/InboxScreen'
import CalendarScreen from '../screens/CalendarScreen'
import MoreScreen from '../screens/MoreScreen'
import CompleteProfileScreen from '../screens/CompleteProfileScreen'
import ProfileScreen from '../screens/ProfileScreen'
import PreferencesScreen from '../screens/PreferencesScreen'
import SettingsScreen from '../screens/SettingsScreen'
import HelpCenterScreen from '../screens/HelpCenterScreen'
import LegalScreen from '../screens/LegalScreen'
import MessageThreadScreen from '../screens/MessageThreadScreen'
import UserProfileScreen from '../screens/UserProfileScreen'
import EditProfileScreen from '../screens/EditProfileScreen'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import BookScreen from '../screens/BookScreen'
import AvailabilityScreen from '../screens/AvailabilityScreen'

import { Feather, MaterialIcons, Entypo } from '@expo/vector-icons'
import { ThemedIcon } from '../components/themed'
import { Animated, View, TouchableOpacity } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Helper: CrossFadeWrapper for tab screens
function CrossFadeWrapper({ children }: { children: React.ReactNode }) {
  const isFocused = useIsFocused()
  const opacity = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: isFocused ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [isFocused])

  return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>
}

function BookTabBarButton({ children, onPress }: any) {
  const { theme } = useTheme()
  return (
    <View style={{ position: 'absolute', top: -28, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 8,
          borderWidth: 2,
          borderColor: theme.colors.card,
        }}
        accessibilityLabel="Book an event"
      >
        <ThemedIcon type="ionicons" name="add-circle" color="#fff" size={36} />
      </TouchableOpacity>
    </View>
  )
}

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
        lazy: true,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />, 
        }}
      >{() => <CrossFadeWrapper><WelcomeScreen /></CrossFadeWrapper>}</Tab.Screen>
      <Tab.Screen
        name="Inbox"
        options={{
          tabBarIcon: ({ color, size }) => <ThemedIcon type="ionicons" name="chatbubble-outline" color={color} size={size} />, 
        }}
      >{() => <CrossFadeWrapper><InboxScreen /></CrossFadeWrapper>}</Tab.Screen>
      <Tab.Screen
        name="Book"
        options={{
          tabBarButton: (props) => <BookTabBarButton {...props} />, // Custom FAB
          tabBarLabel: () => null, // Hide label
        }}
      >{() => <CrossFadeWrapper><BookScreen /></CrossFadeWrapper>}</Tab.Screen>
      <Tab.Screen
        name="Calendar"
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-today" color={color} size={size} />, 
        }}
      >{() => <CrossFadeWrapper><CalendarScreen /></CrossFadeWrapper>}</Tab.Screen>
      <Tab.Screen
        name="More"
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="dots-three-horizontal" color={color} size={size - 2} />, 
        }}
      >{() => <CrossFadeWrapper><MoreScreen /></CrossFadeWrapper>}</Tab.Screen>
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
            <Stack.Screen
              name="Help"
              component={HelpCenterScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Legal"
              component={LegalScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="MessageThread"
              component={MessageThreadScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Availability"
              component={AvailabilityScreen}
              options={{
                headerShown: false,
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
