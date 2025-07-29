import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function CalendarEventsScreen() {
  const { theme } = useTheme()

  const calendarBasics = [
    {
      title: 'Viewing Your Calendar',
      description: 'Tap the Calendar tab to view your schedule. Events are displayed by date and time.',
      icon: { type: 'ionicons' as const, name: 'calendar-outline' }
    },
    {
      title: 'Creating Events',
      description: 'Use the Book tab to create new events. Fill in the details and invite participants.',
      icon: { type: 'ionicons' as const, name: 'add-circle-outline' }
    },
    {
      title: 'Event Details',
      description: 'Tap on any event to view details, edit information, or manage participants.',
      icon: { type: 'ionicons' as const, name: 'information-circle-outline' }
    },
    {
      title: 'Event Notifications',
      description: 'Receive reminders for upcoming events. Customize notification timing in settings.',
      icon: { type: 'ionicons' as const, name: 'notifications-outline' }
    }
  ]

  const eventFeatures = [
    {
      title: 'Event Types',
      description: 'Create different types of events: meetings, appointments, social gatherings, and more.',
      icon: { type: 'ionicons' as const, name: 'list-outline' }
    },
    {
      title: 'Invite Participants',
      description: 'Send invitations to other users. Track who has accepted, declined, or not responded.',
      icon: { type: 'ionicons' as const, name: 'people-outline' }
    },
    {
      title: 'Event Location',
      description: 'Add location details to your events. Include address, venue, or virtual meeting links.',
      icon: { type: 'ionicons' as const, name: 'location-outline' }
    },
    {
      title: 'Event Description',
      description: 'Add detailed descriptions, agendas, or notes to help participants prepare.',
      icon: { type: 'ionicons' as const, name: 'document-text-outline' }
    }
  ]

  const calendarTips = [
    {
      title: 'Plan Ahead',
      description: 'Create events well in advance to give participants time to respond and prepare.',
      icon: { type: 'ionicons' as const, name: 'time-outline' }
    },
    {
      title: 'Set Reminders',
      description: 'Configure notifications to ensure you never miss an important event.',
      icon: { type: 'ionicons' as const, name: 'alarm-outline' }
    },
    {
      title: 'Keep Updated',
      description: 'Regularly check your calendar for new invitations and event updates.',
      icon: { type: 'ionicons' as const, name: 'refresh-outline' }
    },
    {
      title: 'Manage Conflicts',
      description: 'Check for scheduling conflicts before creating new events.',
      icon: { type: 'ionicons' as const, name: 'warning-outline' }
    }
  ]

  const troubleshooting = [
    {
      title: 'Events Not Showing',
      description: 'Refresh the calendar or restart the app. Check your internet connection.',
      icon: { type: 'ionicons' as const, name: 'wifi-outline' }
    },
    {
      title: 'Can\'t Create Events',
      description: 'Ensure you have the necessary permissions and try again. Contact support if the issue persists.',
      icon: { type: 'ionicons' as const, name: 'construct-outline' }
    },
    {
      title: 'Notifications Not Working',
      description: 'Check your device notification settings and app permissions.',
      icon: { type: 'ionicons' as const, name: 'settings-outline' }
    },
    {
      title: 'Sync Issues',
      description: 'Pull down to refresh or log out and back in to sync your calendar data.',
      icon: { type: 'ionicons' as const, name: 'sync-outline' }
    }
  ]

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <BackButton iconName="arrow-back" />
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Calendar & Events</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="calendar-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Calendar & Events Help</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            Learn how to manage your calendar, create events, and stay organized with scheduling features.
          </ThemedText>
        </View>

        {/* Calendar Basics */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Calendar Basics</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {calendarBasics.map((basic, index) => (
            <View key={index} style={[styles.basicItem, index === calendarBasics.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={basic.icon.type} name={basic.icon.name} size={24} color={theme.colors.primary} style={styles.basicIcon} />
              <View style={styles.basicContent}>
                <ThemedText style={[styles.basicTitle, { color: theme.colors.text }]}>{basic.title}</ThemedText>
                <ThemedText style={[styles.basicDescription, { color: theme.colors.mutedText }]}>{basic.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Event Features */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Event Features</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {eventFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureItem, index === eventFeatures.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={feature.icon.type} name={feature.icon.name} size={20} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureContent}>
                <ThemedText style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</ThemedText>
                <ThemedText style={[styles.featureDescription, { color: theme.colors.mutedText }]}>{feature.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Calendar Tips */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Calendar Tips</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {calendarTips.map((tip, index) => (
            <View key={index} style={[styles.tipItem, index === calendarTips.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={tip.icon.type} name={tip.icon.name} size={20} color={theme.colors.primary} style={styles.tipIcon} />
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</ThemedText>
                <ThemedText style={[styles.tipDescription, { color: theme.colors.mutedText }]}>{tip.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Troubleshooting */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Troubleshooting</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {troubleshooting.map((issue, index) => (
            <View key={index} style={[styles.issueItem, index === troubleshooting.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={issue.icon.type} name={issue.icon.name} size={20} color={theme.colors.primary} style={styles.issueIcon} />
              <View style={styles.issueContent}>
                <ThemedText style={[styles.issueTitle, { color: theme.colors.text }]}>{issue.title}</ThemedText>
                <ThemedText style={[styles.issueDescription, { color: theme.colors.mutedText }]}>{issue.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Best Practices */}
        <View style={[styles.bestPracticesCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.bestPracticesTitle, { color: theme.colors.text }]}>Best Practices</ThemedText>
          <ThemedText style={[styles.bestPracticesDescription, { color: theme.colors.mutedText }]}>
            • Create events with clear titles and descriptions\n• Set appropriate reminder times\n• Include all necessary details (location, agenda, etc.)\n• Respond to invitations promptly\n• Keep your calendar updated and organized
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
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
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  basicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  basicIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  basicContent: {
    flex: 1,
  },
  basicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  basicDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  featureIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  tipIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  issueIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bestPracticesCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bestPracticesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bestPracticesDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
}) 