import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'
import { APP_VERSION } from '../../config'

export default function AboutAppScreen() {
  const { theme } = useTheme()

  const appInfo = {
    name: 'CM Mobile',
    version: APP_VERSION,
    buildNumber: '2025.0.11',
    description: 'A modern React Native app boilerplate with Supabase integration, featuring authentication, real-time messaging, and a complete mobile app foundation.',
    features: [
      'React Native with Expo framework',
      'Supabase backend integration',
      'Real-time messaging and notifications',
      'User authentication and profiles',
      'Themed UI components and dark mode',
      'Navigation with React Navigation',
      'TypeScript for type safety',
      'Cross-platform compatibility'
    ]
  }

  const teamInfo = [
    {
      role: 'Boilerplate Creator',
      description: 'This app boilerplate was created to provide a solid foundation for building React Native applications with modern best practices and comprehensive features.'
    },
    {
      role: 'Open Source',
      description: 'This boilerplate is open source and available for developers to use as a starting point for their own mobile applications.'
    }
  ]

  const contactInfo = [
    {
      type: 'GitHub',
      value: 'github.com/cm-mobile-stack',
      icon: { type: 'ionicons' as const, name: 'logo-github' }
    },
    {
      type: 'Documentation',
      value: 'docs.cmmobile.com',
      icon: { type: 'ionicons' as const, name: 'document-text-outline' }
    },
    {
      type: 'Issues',
      value: 'Report bugs on GitHub',
      icon: { type: 'ionicons' as const, name: 'bug-outline' }
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>About App</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={[styles.appInfoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.appIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="phone-portrait" size={48} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.appName, { color: theme.colors.text }]}>{appInfo.name}</ThemedText>
          <ThemedText style={[styles.appVersion, { color: theme.colors.mutedText }]}>Version {appInfo.version} ({appInfo.buildNumber})</ThemedText>
          <ThemedText style={[styles.appDescription, { color: theme.colors.mutedText }]}>{appInfo.description}</ThemedText>
        </View>

        {/* Features */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Features</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {appInfo.features.map((feature, index) => (
            <View key={index} style={[styles.featureItem, index === appInfo.features.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type="ionicons" name="checkmark-circle" size={20} color={theme.colors.primary} style={styles.featureIcon} />
              <ThemedText style={[styles.featureText, { color: theme.colors.text }]}>{feature}</ThemedText>
            </View>
          ))}
        </View>

        {/* Team */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Our Team</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {teamInfo.map((team, index) => (
            <View key={index} style={[styles.teamItem, index === teamInfo.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedText style={[styles.teamRole, { color: theme.colors.text }]}>{team.role}</ThemedText>
              <ThemedText style={[styles.teamDescription, { color: theme.colors.mutedText }]}>{team.description}</ThemedText>
            </View>
          ))}
        </View>

        {/* Contact */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Contact</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {contactInfo.map((contact, index) => (
            <View key={index} style={[styles.contactItem, index === contactInfo.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={contact.icon.type} name={contact.icon.name} size={20} color={theme.colors.primary} style={styles.contactIcon} />
              <View style={styles.contactContent}>
                <ThemedText style={[styles.contactType, { color: theme.colors.text }]}>{contact.type}</ThemedText>
                <ThemedText style={[styles.contactValue, { color: theme.colors.mutedText }]}>{contact.value}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Copyright */}
        <View style={styles.copyrightContainer}>
          <ThemedText style={[styles.copyrightText, { color: theme.colors.mutedText }]}>
            © 2025 CM Mobile Stack. Open source boilerplate.
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
  appInfoCard: {
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
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  appDescription: {
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  featureIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  teamItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  teamRole: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  contactIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
  },
  contactType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  copyrightContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 16,
  },
  copyrightText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
}) 