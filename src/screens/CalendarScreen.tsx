// CalendarScreen.tsx
import { useEffect, useState } from 'react'
import {
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { useNavigation } from '@react-navigation/native'
import { 
  ThemedView,
  ThemedText,
  ThemedImage,
  ThemedTouchableOpacity,
} from '../components/themed'
import { useTheme } from '../context/themeContext'
import { useRefreshableScroll } from '../hooks/useRefreshableScroll'

type Event = {
  id: string
  title: string
  time: string
  type: 'meeting' | 'reminder' | 'task'
}

export default function CalendarScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const { theme } = useTheme()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchUserData = async () => {
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('first_name, profile_url')
      .eq('id', user.id)
      .single()

    if (data) {
      setFirstName(data.first_name)
      setProfileUrl(data.profile_url)
    }
    setLoading(false)
  }

  const { refreshControl } = useRefreshableScroll(fetchUserData)

  useEffect(() => {
    fetchUserData()
  }, [user])

  const today = format(new Date(), 'EEEE, MMM d')
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Mock events for selected date
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Team Meeting',
      time: '10:00 AM',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Project Review',
      time: '2:30 PM',
      type: 'meeting'
    },
    {
      id: '3',
      title: 'Submit Report',
      time: '5:00 PM',
      type: 'task'
    }
  ]

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return theme.colors.primary
      case 'reminder':
        return '#FF9500'
      case 'task':
        return '#34C759'
      default:
        return theme.colors.primary
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.root}>
      <ThemedView style={[styles.header, { borderColor: theme.colors.border }]}>
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.greeting}>Calendar</ThemedText>
          <ThemedText style={styles.date}>{today}</ThemedText>
        </ThemedView>
        {profileUrl && (
          <ThemedTouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <ThemedImage source={{ uri: profileUrl }} style={styles.avatar} cacheKey={profileUrl} />
          </ThemedTouchableOpacity>
        )}
      </ThemedView>

      <ScrollView refreshControl={refreshControl} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <ThemedTouchableOpacity onPress={() => {
            const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
            setCurrentDate(prevMonth)
          }}>
            <ThemedText style={[styles.monthNav, { color: theme.colors.primary }]}>‹</ThemedText>
          </ThemedTouchableOpacity>
          <ThemedText style={[styles.monthTitle, { color: theme.colors.text }]}>
            {format(currentDate, 'MMMM yyyy')}
          </ThemedText>
          <ThemedTouchableOpacity onPress={() => {
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
            setCurrentDate(nextMonth)
          }}>
            <ThemedText style={[styles.monthNav, { color: theme.colors.primary }]}>›</ThemedText>
          </ThemedTouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <View key={day} style={styles.dayHeader}>
              <ThemedText style={[styles.dayHeaderText, { color: theme.colors.mutedText }]}>
                {day}
              </ThemedText>
            </View>
          ))}

          {/* Calendar days */}
          {daysInMonth.map(day => {
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <ThemedTouchableOpacity
                key={day.toISOString()}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: theme.colors.primary },
                  isCurrentDay && !isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <ThemedText style={[
                  styles.dayText,
                  { color: isCurrentMonth ? theme.colors.text : theme.colors.mutedText },
                  isSelected && { color: '#fff' },
                  isCurrentDay && !isSelected && { color: theme.colors.primary, fontWeight: 'bold' }
                ]}>
                  {format(day, 'd')}
                </ThemedText>
              </ThemedTouchableOpacity>
            )
          })}
        </View>

        {/* Events for selected date */}
        <View style={styles.eventsSection}>
          <ThemedText style={[styles.eventsTitle, { color: theme.colors.text }]}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </ThemedText>
          
          {mockEvents.map(event => (
            <View key={event.id} style={[styles.eventItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={[styles.eventDot, { backgroundColor: getEventColor(event.type) }]} />
              <View style={styles.eventContent}>
                <ThemedText style={[styles.eventTitle, { color: theme.colors.text }]}>
                  {event.title}
                </ThemedText>
                <ThemedText style={[styles.eventTime, { color: theme.colors.mutedText }]}>
                  {event.time}
                </ThemedText>
              </View>
            </View>
          ))}

          {mockEvents.length === 0 && (
            <View style={styles.emptyEvents}>
              <ThemedText style={[styles.emptyEventsText, { color: theme.colors.mutedText }]}>
                No events scheduled
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
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
  userInfo: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthNav: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventsSection: {
    marginTop: 4,
    paddingBottom: 80, // Add padding for tab bar
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
  },
  emptyEvents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEventsText: {
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}) 