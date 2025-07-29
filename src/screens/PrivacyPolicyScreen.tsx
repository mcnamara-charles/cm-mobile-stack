import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme()

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include:\n\n• Personal information (name, email, phone number)\n• Profile information (bio, preferences, location)\n• Communication data (messages, notifications)\n• Usage data (app interactions, features used)'
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Process transactions and send related information\n• Send technical notices, updates, and support messages\n• Respond to your comments and questions\n• Communicate with you about products, services, and events'
    },
    {
      title: '3. Information Sharing',
      content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:\n\n• With your explicit consent\n• To comply with legal obligations\n• To protect our rights and safety\n• In connection with a business transfer or merger'
    },
    {
      title: '4. Data Security',
      content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.'
    },
    {
      title: '5. Data Retention',
      content: 'We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. We may retain certain information for longer periods to comply with legal obligations or resolve disputes.'
    },
    {
      title: '6. Your Rights',
      content: 'You have the right to:\n\n• Access your personal information\n• Correct inaccurate information\n• Request deletion of your data\n• Object to processing of your data\n• Data portability\n• Withdraw consent at any time'
    },
    {
      title: '7. Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.'
    },
    {
      title: '8. Third-Party Services',
      content: 'Our service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.'
    },
    {
      title: '9. Children\'s Privacy',
      content: 'Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us.'
    },
    {
      title: '10. International Transfers',
      content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this policy.'
    },
    {
      title: '11. Changes to This Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the service after any changes constitutes acceptance of the updated policy.'
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Privacy Policy</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="shield-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Privacy Policy</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.colors.mutedText }]}>Last updated: July 29, 2025</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            This Privacy Policy describes how CM Mobile collects, uses, and protects your personal information when you use our service.
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
          <ThemedText style={[styles.contactTitle, { color: theme.colors.text }]}>Contact Us</ThemedText>
          <ThemedText style={[styles.contactText, { color: theme.colors.mutedText }]}>
            If you have any questions about this Privacy Policy, please contact us at privacy@cmmobile.com
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