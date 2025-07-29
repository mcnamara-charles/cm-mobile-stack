import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function DataProcessingAgreementScreen() {
  const { theme } = useTheme()

  const sections = [
    {
      title: '1. Purpose and Scope',
      content: 'This Data Processing Agreement (DPA) governs the processing of personal data by CM Mobile in accordance with applicable data protection laws, including the General Data Protection Regulation (GDPR). This agreement applies to all data processing activities related to our mobile application and services.'
    },
    {
      title: '2. Definitions',
      content: 'For the purposes of this agreement:\n\n• "Personal Data" means any information relating to an identified or identifiable natural person\n• "Processing" means any operation performed on personal data\n• "Data Controller" means the entity determining the purposes and means of processing\n• "Data Processor" means the entity processing personal data on behalf of the controller'
    },
    {
      title: '3. Processing Activities',
      content: 'We process personal data for the following purposes:\n\n• User account management and authentication\n• Service delivery and functionality\n• Communication and notifications\n• Analytics and service improvement\n• Legal compliance and security\n• Customer support and troubleshooting'
    },
    {
      title: '4. Categories of Personal Data',
      content: 'We process the following categories of personal data:\n\n• Identity data (name, email, phone number)\n• Profile data (preferences, settings, bio)\n• Usage data (app interactions, features used)\n• Communication data (messages, notifications)\n• Technical data (device information, IP addresses)'
    },
    {
      title: '5. Data Subject Rights',
      content: 'Data subjects have the following rights:\n\n• Right of access to their personal data\n• Right to rectification of inaccurate data\n• Right to erasure ("right to be forgotten")\n• Right to restrict processing\n• Right to data portability\n• Right to object to processing\n• Right to withdraw consent'
    },
    {
      title: '6. Security Measures',
      content: 'We implement appropriate technical and organizational security measures:\n\n• Encryption of data in transit and at rest\n• Access controls and authentication\n• Regular security assessments\n• Incident response procedures\n• Staff training on data protection\n• Physical and environmental security'
    },
    {
      title: '7. Data Transfers',
      content: 'Personal data may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure appropriate safeguards are in place through:\n\n• Standard contractual clauses\n• Adequacy decisions\n• Binding corporate rules\n• Other approved transfer mechanisms'
    },
    {
      title: '8. Subprocessors',
      content: 'We may engage subprocessors to assist in providing our services. All subprocessors are bound by contractual obligations to:\n\n• Process data only as instructed\n• Implement appropriate security measures\n• Assist with data subject rights\n• Provide audit and inspection rights'
    },
    {
      title: '9. Data Breach Procedures',
      content: 'In the event of a personal data breach, we will:\n\n• Notify supervisory authorities within 72 hours\n• Notify affected data subjects without undue delay\n• Document all breaches and remedial actions\n• Assess and mitigate risks to data subjects'
    },
    {
      title: '10. Audit Rights',
      content: 'Data controllers have the right to audit our data processing activities. We will:\n\n• Provide reasonable access to our facilities\n• Allow inspection of relevant documentation\n• Cooperate with supervisory authority audits\n• Maintain records of processing activities'
    },
    {
      title: '11. Data Retention',
      content: 'We retain personal data only for as long as necessary to:\n\n• Provide our services\n• Comply with legal obligations\n• Resolve disputes\n• Enforce agreements\n\nData is securely deleted or anonymized when no longer needed.'
    },
    {
      title: '12. Termination',
      content: 'Upon termination of this agreement, we will:\n\n• Return or delete all personal data\n• Provide certification of deletion\n• Maintain confidentiality obligations\n• Continue to process data if required by law'
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Data Processing Agreement</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="settings-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Data Processing Agreement</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.colors.mutedText }]}>Last updated: July 29, 2025</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            This agreement outlines how CM Mobile processes personal data in compliance with data protection regulations.
          </ThemedText>
        </View>

        {/* Agreement Sections */}
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
            For questions about this Data Processing Agreement, please contact our Data Protection Officer at dpo@cmmobile.com
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