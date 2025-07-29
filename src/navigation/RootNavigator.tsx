import React, { useEffect, useState, useRef } from 'react'
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme,
  useNavigationContainerRef,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather, MaterialIcons, Entypo } from '@expo/vector-icons'
import { Animated, View, TouchableOpacity } from 'react-native'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/themeContext'
import { supabase } from '../services/supabaseClient'
import { navigationRef } from '../utils/navigationRef'
import { useRealtimeMessages } from '../context/MessageRealtimeContext'

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
import BookScreen from '../screens/BookScreen'
import AvailabilityScreen from '../screens/AvailabilityScreen'

import InAppMessageBanner from '../components/InAppMessageBanner'
import { ThemedIcon } from '../components/themed'
import { useIsFocused } from '@react-navigation/native'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

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

function BookTabBarButton({ onPress }: any) {
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

function MainTabs({ unreadCount }: { unreadCount: number }) {
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
      <Tab.Screen name="Home" options={{ tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }}>
        {() => <CrossFadeWrapper><WelcomeScreen /></CrossFadeWrapper>}
      </Tab.Screen>
      <Tab.Screen name="Inbox" options={{
        tabBarIcon: ({ color, size }) => (
          <View>
            <ThemedIcon type="ionicons" name="chatbubble-outline" color={color} size={size} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -1,
                right: -6,
                backgroundColor: theme.colors.danger ?? '#f00',
                width: 16,
                height: 16,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Animated.Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Animated.Text>
              </View>
            )}
          </View>
        ),
      }}>
        {() => <CrossFadeWrapper><InboxScreen /></CrossFadeWrapper>}
      </Tab.Screen>
      <Tab.Screen name="Book" options={{
        tabBarButton: (props) => <BookTabBarButton {...props} />,
        tabBarLabel: () => null,
      }}>
        {() => <CrossFadeWrapper><BookScreen /></CrossFadeWrapper>}
      </Tab.Screen>
      <Tab.Screen name="Calendar" options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-today" color={color} size={size} /> }}>
        {() => <CrossFadeWrapper><CalendarScreen /></CrossFadeWrapper>}
      </Tab.Screen>
      <Tab.Screen name="More" options={{ tabBarIcon: ({ color, size }) => <Entypo name="dots-three-horizontal" color={color} size={size - 2} /> }}>
        {() => <CrossFadeWrapper><MoreScreen /></CrossFadeWrapper>}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { user, loading } = useAuth()
  const { themeName, theme } = useTheme()
  const { latestMessage } = useRealtimeMessages()
  const [unreadCount, setUnreadCount] = useState(0)
  const [profileIncomplete, setProfileIncomplete] = useState(false)

  const navRef = navigationRef
  const routeNameRef = useRef<string>('') // Empty string as safe default

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

  const fetchUnreadCount = async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('recipient_id', user.id)
      .is('read_at', null)

    if (!error && data) {
      setUnreadCount(Math.min(data.length ?? 0, 99))
    }
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

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user?.id])

  useEffect(() => {
    if (latestMessage?.recipient_id === user?.id) {
      setUnreadCount((prev) => Math.min(prev + 1, 99))
    }
  }, [latestMessage])

  if (loading) return null

  return (
    <NavigationContainer
      theme={navigationTheme}
      ref={navRef}
      onReady={() => {
        routeNameRef.current = navRef.getCurrentRoute()?.name ?? ''
      }}
      onStateChange={() => {
        const currentRoute = navRef.getCurrentRoute()?.name
        const previousRoute = routeNameRef.current

        if (previousRoute === 'MessageThread' && currentRoute !== 'MessageThread') {
          fetchUnreadCount()
        }

        routeNameRef.current = currentRoute ?? ''
      }}
    >
      {user && !loading && <InAppMessageBanner />}
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
            <Stack.Screen name="MainTabs">
              {() => <MainTabs unreadCount={unreadCount} />}
            </Stack.Screen>
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="Help" component={HelpCenterScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="Legal" component={LegalScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="MessageThread" component={MessageThreadScreen} options={{ animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }} />
            <Stack.Screen name="Availability" component={AvailabilityScreen} options={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
