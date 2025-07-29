import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function MessagingScreen() {
  const { theme } = useTheme()

  const messagingBasics = [
    {
      title: 'Starting a Conversation',
      description: 'Tap the "New Message" button to start a conversation with another user. You can search for users by name or email.',
      icon: { type: 'ionicons' as const, name: 'chatbubble-ellipses-outline' }
    },
    {
      title: 'Sending Messages',
      description: 'Type your message in the text field and tap the send button. You can also use voice messages and emojis.',
      icon: { type: 'ionicons' as const, name: 'send-outline' }
    },
    {
      title: 'Reading Messages',
      description: 'Messages appear in real-time. Unread messages are marked with a blue dot. Tap on a conversation to view all messages.',
      icon: { type: 'ionicons' as const, name: 'mail-unread-outline' }
    },
    {
      title: 'Message Status',
      description: 'Sent, delivered, and read receipts help you know when your messages have been received and read.',
      icon: { type: 'ionicons' as const, name: 'checkmark-done-outline' }
    }
  ]

  const messagingFeatures = [
    {
      title: 'Real-time Messaging',
      description: 'Messages are delivered instantly and appear in real-time without needing to refresh.',
      icon: { type: 'ionicons' as const, name: 'flash-outline' }
    },
    {
      title: 'Message History',
      description: 'All your conversations are saved and can be accessed anytime. Search through your message history.',
      icon: { type: 'ionicons' as const, name: 'time-outline' }
    },
    {
      title: 'Notifications',
      description: 'Get push notifications for new messages. Customize notification settings in your profile.',
      icon: { type: 'ionicons' as const, name: 'notifications-outline' }
    },
    {
      title: 'Message Reactions',
      description: 'React to messages with emojis to express your feelings quickly.',
      icon: { type: 'ionicons' as const, name: 'happy-outline' }
    }
  ]

  const messagingTips = [
    {
      title: 'Be Respectful',
      description: 'Always be polite and respectful in your messages. Remember that real people are on the other end.',
      icon: { type: 'ionicons' as const, name: 'heart-outline' }
    },
    {
      title: 'Use Clear Language',
      description: 'Write clear, concise messages to avoid misunderstandings.',
      icon: { type: 'ionicons' as const, name: 'text-outline' }
    },
    {
      title: 'Check Before Sending',
      description: 'Review your message before sending to ensure it conveys the right tone and meaning.',
      icon: { type: 'ionicons' as const, name: 'eye-outline' }
    },
    {
      title: 'Respect Privacy',
      description: 'Don\'t share personal information about others without their consent.',
      icon: { type: 'ionicons' as const, name: 'shield-outline' }
    }
  ]

  const troubleshooting = [
    {
      title: 'Messages Not Sending',
      description: 'Check your internet connection and try again. If the problem persists, restart the app.',
      icon: { type: 'ionicons' as const, name: 'wifi-outline' }
    },
    {
      title: 'Not Receiving Messages',
      description: 'Check your notification settings and ensure the app has permission to send notifications.',
      icon: { type: 'ionicons' as const, name: 'settings-outline' }
    },
    {
      title: 'Messages Not Loading',
      description: 'Pull down to refresh the conversation or restart the app if messages aren\'t appearing.',
      icon: { type: 'ionicons' as const, name: 'refresh-outline' }
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Messaging</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="chatbubble-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Messaging Help</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            Learn how to send and receive messages, manage conversations, and use messaging features effectively.
          </ThemedText>
        </View>

        {/* Messaging Basics */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Messaging Basics</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {messagingBasics.map((basic, index) => (
            <View key={index} style={[styles.basicItem, index === messagingBasics.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={basic.icon.type} name={basic.icon.name} size={24} color={theme.colors.primary} style={styles.basicIcon} />
              <View style={styles.basicContent}>
                <ThemedText style={[styles.basicTitle, { color: theme.colors.text }]}>{basic.title}</ThemedText>
                <ThemedText style={[styles.basicDescription, { color: theme.colors.mutedText }]}>{basic.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Messaging Features */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Messaging Features</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {messagingFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureItem, index === messagingFeatures.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={feature.icon.type} name={feature.icon.name} size={20} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureContent}>
                <ThemedText style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</ThemedText>
                <ThemedText style={[styles.featureDescription, { color: theme.colors.mutedText }]}>{feature.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Messaging Tips */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Messaging Tips</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {messagingTips.map((tip, index) => (
            <View key={index} style={[styles.tipItem, index === messagingTips.length - 1 && { borderBottomWidth: 0 }]}>
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

        {/* Contact Support */}
        <View style={[styles.supportCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.supportTitle, { color: theme.colors.text }]}>Need More Help?</ThemedText>
          <ThemedText style={[styles.supportDescription, { color: theme.colors.mutedText }]}>
            If you\'re experiencing issues with messaging, contact our support team for assistance.
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
  supportCard: {
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
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
}) 