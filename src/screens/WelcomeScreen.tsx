// WelcomeScreen.tsx - Award-winning redesign
import { useEffect, useState, useRef } from 'react'
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { useNavigation } from '@react-navigation/native'
import { fetchLatestMessagesForUser } from '../services/api/messages'
import {
  ThemedView,
  ThemedText,
  ThemedImage,
  ThemedTouchableOpacity,
  ThemedIcon,
} from '../components/themed'
import { useTheme } from '../context/themeContext'
import { useRefreshableScroll } from '../hooks/useRefreshableScroll'
import { LinearGradient } from 'expo-linear-gradient'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function WelcomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const { theme } = useTheme()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [todayEvents, setTodayEvents] = useState(0)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const cardSlideAnim = useRef(new Animated.Value(30)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const fetchUserData = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('users')
        .select('first_name, profile_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setFirstName(data.first_name)
        setProfileUrl(data.profile_url)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummaryData = async () => {
    if (!user) return
    try {
      // Fetch unread messages count
      const messages = await fetchLatestMessagesForUser(user.id)
      const totalUnread = messages.reduce((total, msg) => total + (msg.unread_count || 0), 0)
      setUnreadCount(totalUnread)

      // For now, set today events to 0 (can be enhanced later with actual calendar events)
      setTodayEvents(0)
    } catch (error) {
      console.error('Error fetching summary data:', error)
    }
  }

  const { refreshControl } = useRefreshableScroll(fetchUserData)

  useEffect(() => {
    fetchUserData()
  }, [user])

  useEffect(() => {
    if (!loading) {
      fetchSummaryData()
    }
  }, [loading, user])

  useEffect(() => {
    if (!loading) {
      // Staggered animations for a stunning entrance
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()

      // Subtle pulse animation for the CTA
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }, [loading])

  const today = format(new Date(), 'EEEE, MMMM d')
  const timeOfDay = new Date().getHours()
  const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <View style={[styles.loadingIcon, { backgroundColor: theme.colors.primary }]}>
            <ThemedIcon type="ionicons" name="chatbubbles" size={32} color="#fff" />
          </View>
          <ThemedText style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading your experience...
          </ThemedText>
        </Animated.View>
      </ThemedView>
    )
  }

  const QuickActionCard = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    gradient, 
    delay = 0 
  }: {
    icon: string
    title: string
    subtitle: string
    onPress: () => void
    gradient: readonly [string, string]
    delay?: number
  }) => {
    const cardAnim = useRef(new Animated.Value(0)).current
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }).start()
    }, [])

    return (
      <Animated.View style={{ opacity: cardAnim, transform: [{ scale: cardAnim }] }}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradient}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickActionIcon}>
              <ThemedIcon type="ionicons" name={icon} size={20} color="#fff" />
            </View>
            <View style={styles.quickActionTextContainer}>
              <ThemedText style={styles.quickActionTitle} numberOfLines={1}>
                {title}
              </ThemedText>
              <ThemedText style={styles.quickActionSubtitle} numberOfLines={2}>
                {subtitle}
              </ThemedText>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header with Brand Logo */}
        <Animated.View 
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <ThemedImage 
              source={require('../../assets/logo-color.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.headerSubtitle, { color: theme.colors.mutedText }]}>
              Mobile Stack
            </ThemedText>
          </View>
        </Animated.View>

        {/* Welcome Section */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.welcomeHeader}>
            <View style={styles.greetingContainer}>
              <ThemedText style={[styles.greeting, { color: theme.colors.text }]}>
                {greeting}
              </ThemedText>
              <ThemedText style={[styles.name, { color: theme.colors.primary }]}>
                {firstName || 'there'} ✨
              </ThemedText>
            </View>
            
            {profileUrl && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Profile')}
                style={styles.avatarContainer}
              >
                <ThemedImage 
                  source={{ uri: profileUrl }} 
                  style={styles.avatar} 
                  cacheKey={profileUrl} 
                />
                <View style={[styles.avatarRing, { borderColor: theme.colors.primary }]} />
              </TouchableOpacity>
            )}
          </View>
          
          <ThemedText style={[styles.dateText, { color: theme.colors.mutedText }]}>
            {today}
          </ThemedText>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View 
          style={[
            styles.quickActionsSection,
            {
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </ThemedText>
          
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="mail"
              title="Messages"
              subtitle="Check your inbox"
              onPress={() => navigation.navigate('Inbox')}
              gradient={['#667eea', '#764ba2']}
              delay={200}
            />
            <QuickActionCard
              icon="calendar"
              title="Calendar"
              subtitle="View your schedule"
              onPress={() => navigation.navigate('Calendar')}
              gradient={['#f093fb', '#f5576c']}
              delay={400}
            />
            <QuickActionCard
              icon="person"
              title="Profile"
              subtitle="Manage your account"
              onPress={() => navigation.navigate('Profile')}
              gradient={['#4facfe', '#00f2fe']}
              delay={600}
            />
            <QuickActionCard
              icon="settings"
              title="Settings"
              subtitle="Customize your app"
              onPress={() => navigation.navigate('Settings')}
              gradient={['#43e97b', '#38f9d7']}
              delay={800}
            />
          </View>
        </Animated.View>

        {/* Today's Summary */}
        <Animated.View 
          style={[
            styles.summarySection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.summaryHeader}>
              <ThemedIcon type="ionicons" name="today" size={20} color={theme.colors.primary} />
              <ThemedText style={[styles.summaryTitle, { color: theme.colors.text }]}>
                Today's Summary
              </ThemedText>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <ThemedText style={[styles.summaryLabel, { color: theme.colors.mutedText }]}>
                  Messages
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </ThemedText>
              </View>
              
              <View style={styles.summaryItem}>
                <ThemedText style={[styles.summaryLabel, { color: theme.colors.mutedText }]}>
                  Calendar
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {todayEvents > 0 ? `${todayEvents} events today` : 'No events today'}
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* CTA Section */}
        <Animated.View 
          style={[
            styles.ctaSection,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Inbox')}
            activeOpacity={0.9}
          >
            <ThemedIcon type="ionicons" name="mail" size={20} color="#fff" />
            <ThemedText style={styles.ctaText}>
              Start Messaging
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 34,
    borderWidth: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - 72) / 2,
    height: 140,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    lineHeight: 20,
  },
  quickActionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  quickActionTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  summarySection: {
    marginBottom: 40,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  summaryContent: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  // Header styles
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
    paddingTop: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerLogo: {
    width: 120,
    height: 36,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.8,
  },
})
