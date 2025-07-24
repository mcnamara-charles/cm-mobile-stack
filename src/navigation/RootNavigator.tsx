import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import MoreScreen from '../screens/MoreScreen'
import CompleteProfileScreen from '../screens/CompleteProfileScreen'
import ProfileScreen from '../screens/ProfileScreen' // ✅ Added import

import { Feather, Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 60,
          borderTopColor: '#eee',
          borderTopWidth: 1,
        },
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
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" color={color} size={size} />,
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
  const [profileIncomplete, setProfileIncomplete] = useState(false)

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
    <NavigationContainer>
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
            <Stack.Screen name="Profile" component={ProfileScreen} options={{
                animation: 'slide_from_right', // Slide in from right (default for iOS)
                gestureEnabled: true,          // Swipe-to-go-back enabled
            }}/>
            </>
        )}
        </Stack.Navigator>
    </NavigationContainer>
    )
}
