import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function CookiePolicyScreen() {
  const { theme } = useTheme()

  const sections = [
    {
      title: '1. What Are Cookies',
      content: 'Cookies are small text files that are stored on your device when you visit our website or use our mobile application. They help us provide you with a better experience by remembering your preferences and analyzing how you use our service.'
    },
    {
      title: '2. Types of Cookies We Use',
      content: 'We use several types of cookies:\n\n• Essential Cookies: Required for the app to function properly\n• Performance Cookies: Help us understand how visitors interact with our app\n• Functional Cookies: Remember your preferences and settings\n• Analytics Cookies: Help us improve our service by collecting usage data'
    },
    {
      title: '3. How We Use Cookies',
      content: 'We use cookies to:\n\n• Remember your login status and preferences\n• Analyze app usage and performance\n• Provide personalized content and features\n• Improve our service and user experience\n• Ensure security and prevent fraud'
    },
    {
      title: '4. Third-Party Cookies',
      content: 'Some cookies are placed by third-party services that appear on our pages. These services may include:\n\n• Analytics providers (Google Analytics)\n• Social media platforms\n• Advertising networks\n• Payment processors'
    },
    {
      title: '5. Cookie Management',
      content: 'You can control and manage cookies in several ways:\n\n• Browser settings: Most browsers allow you to block or delete cookies\n• App settings: You can manage cookie preferences in our app settings\n• Third-party opt-outs: You can opt out of third-party cookies through their respective services'
    },
    {
      title: '6. Mobile App Specific',
      content: 'In our mobile application, we use similar technologies to cookies, including:\n\n• Local storage for app preferences\n• Session storage for temporary data\n• Device identifiers for analytics\n• Push notification tokens'
    },
    {
      title: '7. Data Retention',
      content: 'Cookie data is retained for different periods depending on the type:\n\n• Session cookies: Deleted when you close the app\n• Persistent cookies: Stored for up to 2 years\n• Analytics data: Retained for up to 26 months'
    },
    {
      title: '8. Your Choices',
      content: 'You have the right to:\n\n• Accept or decline cookies\n• Delete existing cookies\n• Set browser preferences to block cookies\n• Opt out of analytics tracking\n• Request information about cookies we use'
    },
    {
      title: '9. Updates to This Policy',
      content: 'We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes.'
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Cookie Policy</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="nutrition-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Cookie Policy</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.colors.mutedText }]}>Last updated: July 29, 2025</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            This Cookie Policy explains how CM Mobile uses cookies and similar technologies to enhance your experience.
          </ThemedText>
        </View>

        {/* Policy Sections */}
        {sections.map((section, index) => (
          <View key={index} style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</ThemedText>
            <ThemedText style={[styles.sectionContent, { color: theme.colors.mutedText }]}>{section.content}</ThemedText>
          </View>
        ))}

        {/* Contact Information */}
        <View style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.contactTitle, { color: theme.colors.text }]}>Questions?</ThemedText>
          <ThemedText style={[styles.contactText, { color: theme.colors.mutedText }]}>
            If you have any questions about our Cookie Policy, please contact us at privacy@cmmobile.com
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
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  contactCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    padding: 20,
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
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
}) 