import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedIcon } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function LegalScreen() {
  const navigation = useNavigation()
  const { theme } = useTheme()

  const legalDocuments = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: { type: 'ionicons', name: 'shield-outline' },
      description: 'How we collect, use, and protect your data',
      lastUpdated: 'Updated March 15, 2024'
    },
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      icon: { type: 'ionicons', name: 'document-text-outline' },
      description: 'Rules and guidelines for using our service',
      lastUpdated: 'Updated March 15, 2024'
    },
    {
      id: 'cookie-policy',
      title: 'Cookie Policy',
      icon: { type: 'ionicons', name: 'nutrition-outline' },
      description: 'How we use cookies and similar technologies',
      lastUpdated: 'Updated March 15, 2024'
    },
    {
      id: 'data-processing',
      title: 'Data Processing Agreement',
      icon: { type: 'ionicons', name: 'settings-outline' },
      description: 'How we process your personal information',
      lastUpdated: 'Updated March 15, 2024'
    }
  ]

  const complianceInfo = [
    {
      title: 'GDPR Compliance',
      description: 'We comply with the General Data Protection Regulation (GDPR) and other applicable data protection laws.',
      icon: { type: 'ionicons', name: 'checkmark-circle-outline' }
    },
    {
      title: 'Data Security',
      description: 'Your data is encrypted and stored securely using industry-standard security measures.',
      icon: { type: 'ionicons', name: 'lock-closed-outline' }
    },
    {
      title: 'Third-Party Services',
      description: 'We use trusted third-party services that also comply with strict privacy standards.',
      icon: { type: 'ionicons', name: 'people-outline' }
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ThemedIcon type="ionicons" name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Legal</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Legal Documents */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Legal Documents</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {legalDocuments.map((document, index) => (
            <ThemedTouchableOpacity
              key={document.id}
              style={[
                styles.legalItem,
                index === legalDocuments.length - 1 && { borderBottomWidth: 0 }
              ]}
              activeOpacity={0.7}
            >
              <ThemedIcon type={document.icon.type} name={document.icon.name} size={24} color={theme.colors.primary} style={styles.legalIcon} />
              <View style={styles.legalContent}>
                <ThemedText style={[styles.legalTitle, { color: theme.colors.text }]}>{document.title}</ThemedText>
                <ThemedText style={[styles.legalDescription, { color: theme.colors.mutedText }]}>{document.description}</ThemedText>
                <ThemedText style={[styles.legalDate, { color: theme.colors.mutedText }]}>{document.lastUpdated}</ThemedText>
              </View>
              <ThemedIcon type="ionicons" name="chevron-forward" size={16} color={theme.colors.mutedText} />
            </ThemedTouchableOpacity>
          ))}
        </View>

        {/* Compliance Information */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Compliance & Security</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {complianceInfo.map((item, index) => (
            <View key={index} style={[styles.complianceItem, index === complianceInfo.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={item.icon.type} name={item.icon.name} size={20} color={theme.colors.primary} style={styles.complianceIcon} />
              <View style={styles.complianceContent}>
                <ThemedText style={[styles.complianceTitle, { color: theme.colors.text }]}>{item.title}</ThemedText>
                <ThemedText style={[styles.complianceDescription, { color: theme.colors.mutedText }]}>{item.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Legal */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Contact Legal Team</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedTouchableOpacity style={[styles.contactItem, { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' }]} activeOpacity={0.7}>
            <ThemedIcon type="ionicons" name="mail-outline" size={20} color={theme.colors.primary} style={styles.contactIcon} />
            <ThemedText style={[styles.contactText, { color: theme.colors.text }]}>Legal Inquiries</ThemedText>
            <ThemedIcon type="ionicons" name="chevron-forward" size={16} color={theme.colors.mutedText} />
          </ThemedTouchableOpacity>
          <ThemedTouchableOpacity style={styles.contactItem} activeOpacity={0.7}>
            <ThemedIcon type="ionicons" name="shield-outline" size={20} color={theme.colors.primary} style={styles.contactIcon} />
            <ThemedText style={[styles.contactText, { color: theme.colors.text }]}>Data Protection Officer</ThemedText>
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
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    minHeight: 80,
  },
  legalIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legalDescription: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  legalDate: {
    fontSize: 12,
    fontWeight: '400',
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  complianceIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  complianceContent: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  complianceDescription: {
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