import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function TermsOfServiceScreen() {
  const { theme } = useTheme()

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using CM Mobile, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      title: '2. Use License',
      content: 'Permission is granted to temporarily download one copy of CM Mobile for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n\n• Modify or copy the materials\n• Use the materials for any commercial purpose or for any public display\n• Attempt to reverse engineer any software contained in CM Mobile\n• Remove any copyright or other proprietary notations from the materials'
    },
    {
      title: '3. User Account',
      content: 'When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.'
    },
    {
      title: '4. Acceptable Use',
      content: 'You agree not to use the service to:\n\n• Violate any applicable laws or regulations\n• Infringe upon the rights of others\n• Transmit harmful, offensive, or inappropriate content\n• Attempt to gain unauthorized access to the service\n• Interfere with the proper functioning of the service'
    },
    {
      title: '5. Privacy and Data Protection',
      content: 'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your personal information.'
    },
    {
      title: '6. Intellectual Property',
      content: 'The service and its original content, features, and functionality are and will remain the exclusive property of CM Mobile and its licensors. The service is protected by copyright, trademark, and other laws.'
    },
    {
      title: '7. Termination',
      content: 'We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.'
    },
    {
      title: '8. Limitation of Liability',
      content: 'In no event shall CM Mobile, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.'
    },
    {
      title: '9. Governing Law',
      content: 'These Terms shall be interpreted and governed by the laws of the jurisdiction in which CM Mobile operates, without regard to its conflict of law provisions.'
    },
    {
      title: '10. Changes to Terms',
      content: 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.'
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Terms of Service</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="document-text-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Terms of Service</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.colors.mutedText }]}>Last updated: July 29, 2025</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            Please read these terms of service carefully before using CM Mobile. By using our service, you agree to be bound by these terms.
          </ThemedText>
        </View>

        {/* Terms Sections */}
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
            If you have any questions about these Terms of Service, please contact us at legal@cmmobile.com
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