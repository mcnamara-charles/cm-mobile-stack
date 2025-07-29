import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function HelpCenterScreen() {
  const navigation = useNavigation()
  const { theme } = useTheme()

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: { type: 'ionicons', name: 'rocket-outline' },
      description: 'Learn the basics of using the app'
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: { type: 'ionicons', name: 'person-outline' },
      description: 'Manage your account settings'
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: { type: 'ionicons', name: 'chatbubble-outline' },
      description: 'How to send and receive messages'
    },
    {
      id: 'calendar',
      title: 'Calendar & Events',
      icon: { type: 'ionicons', name: 'calendar-outline' },
      description: 'Schedule and manage events'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: { type: 'ionicons', name: 'construct-outline' },
      description: 'Common issues and solutions'
    }
  ]

  const faqItems = [
    {
      question: 'How do I change my profile picture?',
      answer: 'Go to Profile > Edit Profile > Tap on your current picture to upload a new one.'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account in Settings > Danger Zone > Delete Account.'
    },
    {
      question: 'How do I enable notifications?',
      answer: 'Go to Settings > Notifications and toggle the switch to enable push notifications.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your personal information.'
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Help Center</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Quick Help */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Quick Help</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {helpCategories.map((category, index) => (
            <ThemedTouchableOpacity
              key={category.id}
              style={[
                styles.helpItem,
                index === helpCategories.length - 1 && { borderBottomWidth: 0 }
              ]}
              activeOpacity={0.7}
            >
              <ThemedIcon type={category.icon.type as 'feather' | 'ionicons' | 'fontawesome'} name={category.icon.name} size={24} color={theme.colors.primary} style={styles.helpIcon} />
              <View style={styles.helpContent}>
                <ThemedText style={[styles.helpTitle, { color: theme.colors.text }]}>{category.title}</ThemedText>
                <ThemedText style={[styles.helpDescription, { color: theme.colors.mutedText }]}>{category.description}</ThemedText>
              </View>
              <ThemedIcon type="ionicons" name="chevron-forward" size={16} color={theme.colors.mutedText} />
            </ThemedTouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Frequently Asked Questions</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {faqItems.map((item, index) => (
            <View key={index} style={[styles.faqItem, index === faqItems.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedText style={[styles.faqQuestion, { color: theme.colors.text }]}>{item.question}</ThemedText>
              <ThemedText style={[styles.faqAnswer, { color: theme.colors.mutedText }]}>{item.answer}</ThemedText>
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Contact Support</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedTouchableOpacity style={[styles.contactItem, { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }]} activeOpacity={0.7}>
            <ThemedIcon type="ionicons" name="mail-outline" size={20} color={theme.colors.primary} style={styles.contactIcon} />
            <ThemedText style={[styles.contactText, { color: theme.colors.text }]}>Email Support</ThemedText>
            <ThemedIcon type="ionicons" name="chevron-forward" size={16} color={theme.colors.mutedText} />
          </ThemedTouchableOpacity>
          <ThemedTouchableOpacity style={styles.contactItem} activeOpacity={0.7}>
            <ThemedIcon type="ionicons" name="chatbubble-outline" size={20} color={theme.colors.primary} style={styles.contactIcon} />
            <ThemedText style={[styles.contactText, { color: theme.colors.text }]}>Live Chat</ThemedText>
            <ThemedIcon type="ionicons" name="chevron-forward" size={16} color={theme.colors.mutedText} />
          </ThemedTouchableOpacity>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    minHeight: 64,
  },
  helpIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  contactIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
}) 