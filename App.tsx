import { StatusBar } from 'expo-status-bar'
import RootNavigator from './src/navigation/RootNavigator'
import { AuthProvider } from './src/context/AuthContext'
import * as Linking from 'expo-linking'
import { useEffect } from 'react'
import { supabase } from './src/services/supabaseClient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Platform } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'

export default function App() {
  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#ffffff') // white background
        await NavigationBar.setButtonStyleAsync('dark')
        await NavigationBar.setPositionAsync('relative')
      }

      const handleDeepLink = async ({ url }: { url: string }) => {
        if (!url.includes('code=')) return
        const { data, error } = await supabase.auth.exchangeCodeForSession(url)
        if (error) console.error('Session exchange failed:', error.message)
      }

      const subscription = Linking.addEventListener('url', handleDeepLink)

      const initialUrl = await Linking.getInitialURL()
      if (initialUrl && initialUrl.includes('code=')) {
        handleDeepLink({ url: initialUrl })
      }

      return () => subscription.remove()
    }

    setup()
  }, [])

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar style="dark" backgroundColor="#fff" />
        <RootNavigator />
      </SafeAreaView>
    </AuthProvider>
  )
}
