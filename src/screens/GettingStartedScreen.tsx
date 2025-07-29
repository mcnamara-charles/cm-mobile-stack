import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function GettingStartedScreen() {
  const { theme } = useTheme()

  const steps = [
    {
      title: '1. Create Your Account',
      description: 'Sign up with your email address and create a secure password. You\'ll receive a verification email to activate your account.',
      icon: { type: 'ionicons' as const, name: 'person-add-outline' }
    },
    {
      title: '2. Complete Your Profile',
      description: 'Add your profile picture, personal information, and preferences to help others get to know you better.',
      icon: { type: 'ionicons' as const, name: 'person-outline' }
    },
    {
      title: '3. Explore the App',
      description: 'Navigate through the main tabs: Home, Inbox, Book, Calendar, and More to discover all available features.',
      icon: { type: 'ionicons' as const, name: 'compass-outline' }
    },
    {
      title: '4. Start Messaging',
      description: 'Connect with other users by sending messages. Use the Inbox tab to view and respond to conversations.',
      icon: { type: 'ionicons' as const, name: 'chatbubble-outline' }
    },
    {
      title: '5. Book Events',
      description: 'Use the Book tab to schedule events and meetings. The Calendar tab helps you manage your schedule.',
      icon: { type: 'ionicons' as const, name: 'calendar-outline' }
    }
  ]

  const tips = [
    {
      title: 'Enable Notifications',
      description: 'Turn on push notifications to stay updated with new messages and event reminders.',
      icon: { type: 'ionicons' as const, name: 'notifications-outline' }
    },
    {
      title: 'Customize Settings',
      description: 'Visit the Settings screen to personalize your experience and manage your account preferences.',
      icon: { type: 'ionicons' as const, name: 'settings-outline' }
    },
    {
      title: 'Get Help',
      description: 'If you need assistance, visit the Help Center or contact our support team.',
      icon: { type: 'ionicons' as const, name: 'help-circle-outline' }
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Getting Started</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="rocket-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.welcomeTitle, { color: theme.colors.text }]}>Welcome to CM Mobile!</ThemedText>
          <ThemedText style={[styles.welcomeDescription, { color: theme.colors.mutedText }]}>
            Follow these simple steps to get started with your new mobile app experience.
          </ThemedText>
        </View>

        {/* Getting Started Steps */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Getting Started Steps</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {steps.map((step, index) => (
            <View key={index} style={[styles.stepItem, index === steps.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={step.icon.type} name={step.icon.name} size={24} color={theme.colors.primary} style={styles.stepIcon} />
              <View style={styles.stepContent}>
                <ThemedText style={[styles.stepTitle, { color: theme.colors.text }]}>{step.title}</ThemedText>
                <ThemedText style={[styles.stepDescription, { color: theme.colors.mutedText }]}>{step.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Pro Tips</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {tips.map((tip, index) => (
            <View key={index} style={[styles.tipItem, index === tips.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={tip.icon.type} name={tip.icon.name} size={20} color={theme.colors.primary} style={styles.tipIcon} />
              <View style={styles.tipContent}>
                <ThemedText style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.title}</ThemedText>
                <ThemedText style={[styles.tipDescription, { color: theme.colors.mutedText }]}>{tip.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Next Steps */}
        <View style={[styles.nextStepsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.nextStepsTitle, { color: theme.colors.text }]}>What's Next?</ThemedText>
          <ThemedText style={[styles.nextStepsDescription, { color: theme.colors.mutedText }]}>
            Now that you're set up, explore the app features and start connecting with others. If you need help, visit our Help Center or contact support.
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
  welcomeCard: {
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
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
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  stepIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
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
  nextStepsCard: {
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
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  nextStepsDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
}) 