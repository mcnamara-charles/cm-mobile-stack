import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export type RootStackParamList = {
    MainTabs: undefined
    Profile: undefined
    Preferences: undefined
    Settings: undefined
    Help: undefined
    GettingStarted: undefined
    AccountProfile: undefined
    Messaging: undefined
    CalendarEvents: undefined
    Troubleshooting: undefined
    Legal: undefined
    AboutApp: undefined
    TermsOfService: undefined
    PrivacyPolicy: undefined
    CookiePolicy: undefined
    DataProcessingAgreement: undefined
    MessageThread: { userId: string }
    UserProfile: undefined
    EditProfile: undefined
    Availability: undefined
    Login: undefined
    Signup: undefined
    CompleteProfile: undefined
  }

// Navigation prop types
export type RootStackNavigationProp<T extends keyof RootStackParamList> = 
  NativeStackNavigationProp<RootStackParamList, T>

// Route prop types
export type RootStackRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>

// Specific screen types
export type MessageThreadNavigationProp = RootStackNavigationProp<'MessageThread'>
export type MessageThreadRouteProp = RootStackRouteProp<'MessageThread'>