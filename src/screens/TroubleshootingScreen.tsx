import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function TroubleshootingScreen() {
  const { theme } = useTheme()

  const commonIssues = [
    {
      title: 'App Won\'t Load',
      description: 'Check your internet connection and try restarting the app. If the problem persists, try clearing the app cache.',
      icon: { type: 'ionicons' as const, name: 'refresh-outline' }
    },
    {
      title: 'Can\'t Sign In',
      description: 'Verify your email and password. Use the "Forgot Password" option if needed. Check your internet connection.',
      icon: { type: 'ionicons' as const, name: 'key-outline' }
    },
    {
      title: 'Messages Not Sending',
      description: 'Check your internet connection and try again. If the problem persists, restart the app.',
      icon: { type: 'ionicons' as const, name: 'chatbubble-outline' }
    },
    {
      title: 'Notifications Not Working',
      description: 'Check your device notification settings and ensure the app has permission to send notifications.',
      icon: { type: 'ionicons' as const, name: 'notifications-outline' }
    }
  ]

  const performanceIssues = [
    {
      title: 'App is Slow',
      description: 'Close other apps to free up memory. Restart the app or restart your device if needed.',
      icon: { type: 'ionicons' as const, name: 'speedometer-outline' }
    },
    {
      title: 'Battery Draining Fast',
      description: 'Check your device\'s battery settings and close unnecessary background apps.',
      icon: { type: 'ionicons' as const, name: 'battery-outline' }
    },
    {
      title: 'App Crashes',
      description: 'Update the app to the latest version. If crashes continue, try reinstalling the app.',
      icon: { type: 'ionicons' as const, name: 'warning-outline' }
    },
    {
      title: 'Data Not Syncing',
      description: 'Check your internet connection and pull down to refresh. Log out and back in if needed.',
      icon: { type: 'ionicons' as const, name: 'sync-outline' }
    }
  ]

  const accountIssues = [
    {
      title: 'Can\'t Update Profile',
      description: 'Check your internet connection and try again. Ensure you have the latest app version.',
      icon: { type: 'ionicons' as const, name: 'person-outline' }
    },
    {
      title: 'Forgot Password',
      description: 'Use the "Forgot Password" option on the login screen to reset your password via email.',
      icon: { type: 'ionicons' as const, name: 'lock-open-outline' }
    },
    {
      title: 'Account Locked',
      description: 'Contact support if your account has been locked due to security concerns.',
      icon: { type: 'ionicons' as const, name: 'shield-outline' }
    },
    {
      title: 'Can\'t Delete Account',
      description: 'Go to Settings > Danger Zone > Delete Account. Contact support if you encounter issues.',
      icon: { type: 'ionicons' as const, name: 'trash-outline' }
    }
  ]

  const technicalSolutions = [
    {
      title: 'Clear App Cache',
      description: 'Go to your device settings > Apps > CM Mobile > Storage > Clear Cache.',
      icon: { type: 'ionicons' as const, name: 'trash-outline' }
    },
    {
      title: 'Update the App',
      description: 'Check your app store for available updates and install the latest version.',
      icon: { type: 'ionicons' as const, name: 'arrow-up-outline' }
    },
    {
      title: 'Restart Device',
      description: 'Power off your device completely and turn it back on to clear any temporary issues.',
      icon: { type: 'ionicons' as const, name: 'power-outline' }
    },
    {
      title: 'Reinstall App',
      description: 'Uninstall and reinstall the app if other solutions don\'t work. Note: You\'ll need to sign in again.',
      icon: { type: 'ionicons' as const, name: 'download-outline' }
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Troubleshooting</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="construct-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Troubleshooting Guide</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            Find solutions to common issues and learn how to resolve problems with the app.
          </ThemedText>
        </View>

        {/* Common Issues */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Common Issues</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {commonIssues.map((issue, index) => (
            <View key={index} style={[styles.issueItem, index === commonIssues.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={issue.icon.type} name={issue.icon.name} size={24} color={theme.colors.primary} style={styles.issueIcon} />
              <View style={styles.issueContent}>
                <ThemedText style={[styles.issueTitle, { color: theme.colors.text }]}>{issue.title}</ThemedText>
                <ThemedText style={[styles.issueDescription, { color: theme.colors.mutedText }]}>{issue.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Issues */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Performance Issues</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {performanceIssues.map((issue, index) => (
            <View key={index} style={[styles.issueItem, index === performanceIssues.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={issue.icon.type} name={issue.icon.name} size={20} color={theme.colors.primary} style={styles.issueIcon} />
              <View style={styles.issueContent}>
                <ThemedText style={[styles.issueTitle, { color: theme.colors.text }]}>{issue.title}</ThemedText>
                <ThemedText style={[styles.issueDescription, { color: theme.colors.mutedText }]}>{issue.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Account Issues */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Account Issues</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {accountIssues.map((issue, index) => (
            <View key={index} style={[styles.issueItem, index === accountIssues.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={issue.icon.type} name={issue.icon.name} size={20} color={theme.colors.primary} style={styles.issueIcon} />
              <View style={styles.issueContent}>
                <ThemedText style={[styles.issueTitle, { color: theme.colors.text }]}>{issue.title}</ThemedText>
                <ThemedText style={[styles.issueDescription, { color: theme.colors.mutedText }]}>{issue.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Technical Solutions */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Technical Solutions</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {technicalSolutions.map((solution, index) => (
            <View key={index} style={[styles.solutionItem, index === technicalSolutions.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={solution.icon.type} name={solution.icon.name} size={20} color={theme.colors.primary} style={styles.solutionIcon} />
              <View style={styles.solutionContent}>
                <ThemedText style={[styles.solutionTitle, { color: theme.colors.text }]}>{solution.title}</ThemedText>
                <ThemedText style={[styles.solutionDescription, { color: theme.colors.mutedText }]}>{solution.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={[styles.supportCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.supportTitle, { color: theme.colors.text }]}>Still Need Help?</ThemedText>
          <ThemedText style={[styles.supportDescription, { color: theme.colors.mutedText }]}>
            If you\'re still experiencing issues after trying these solutions, contact our support team for personalized assistance.
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
    width: 24,
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
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  solutionIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  solutionDescription: {
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