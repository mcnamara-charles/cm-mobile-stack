import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native'
import { ThemedView, ThemedText, ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function AccountProfileScreen() {
  const { theme } = useTheme()

  const accountTopics = [
    {
      title: 'Creating Your Account',
      description: 'Learn how to sign up and create your account with email verification.',
      icon: { type: 'ionicons' as const, name: 'person-add-outline' }
    },
    {
      title: 'Profile Management',
      description: 'Update your profile picture, personal information, and bio.',
      icon: { type: 'ionicons' as const, name: 'person-outline' }
    },
    {
      title: 'Account Settings',
      description: 'Manage your account preferences, privacy settings, and notifications.',
      icon: { type: 'ionicons' as const, name: 'settings-outline' }
    },
    {
      title: 'Security & Privacy',
      description: 'Learn about password changes, two-factor authentication, and data protection.',
      icon: { type: 'ionicons' as const, name: 'shield-outline' }
    },
    {
      title: 'Account Recovery',
      description: 'What to do if you forget your password or lose access to your account.',
      icon: { type: 'ionicons' as const, name: 'key-outline' }
    }
  ]

  const profileFeatures = [
    {
      title: 'Profile Picture',
      description: 'Upload and change your profile picture. Supported formats: JPG, PNG. Maximum size: 5MB.',
      icon: { type: 'ionicons' as const, name: 'camera-outline' }
    },
    {
      title: 'Personal Information',
      description: 'Update your name, email, phone number, and other personal details.',
      icon: { type: 'ionicons' as const, name: 'document-text-outline' }
    },
    {
      title: 'Bio & Description',
      description: 'Add a bio to tell others about yourself and your interests.',
      icon: { type: 'ionicons' as const, name: 'chatbox-outline' }
    },
    {
      title: 'Location & Address',
      description: 'Set your location and address for better local connections.',
      icon: { type: 'ionicons' as const, name: 'location-outline' }
    }
  ]

  const accountActions = [
    {
      title: 'Change Password',
      description: 'Update your account password for enhanced security.',
      icon: { type: 'ionicons' as const, name: 'lock-closed-outline' }
    },
    {
      title: 'Delete Account',
      description: 'Permanently delete your account and all associated data.',
      icon: { type: 'ionicons' as const, name: 'trash-outline' }
    },
    {
      title: 'Export Data',
      description: 'Download a copy of your personal data and information.',
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text }]}>Account & Profile</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <ThemedIcon type="ionicons" name="person-outline" size={32} color={theme.colors.primary} />
          </View>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>Account & Profile Help</ThemedText>
          <ThemedText style={[styles.description, { color: theme.colors.mutedText }]}>
            Learn how to manage your account settings, update your profile, and keep your information secure.
          </ThemedText>
        </View>

        {/* Account Topics */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Account Management</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {accountTopics.map((topic, index) => (
            <View key={index} style={[styles.topicItem, index === accountTopics.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={topic.icon.type} name={topic.icon.name} size={24} color={theme.colors.primary} style={styles.topicIcon} />
              <View style={styles.topicContent}>
                <ThemedText style={[styles.topicTitle, { color: theme.colors.text }]}>{topic.title}</ThemedText>
                <ThemedText style={[styles.topicDescription, { color: theme.colors.mutedText }]}>{topic.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Profile Features */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Profile Features</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {profileFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureItem, index === profileFeatures.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={feature.icon.type} name={feature.icon.name} size={20} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureContent}>
                <ThemedText style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</ThemedText>
                <ThemedText style={[styles.featureDescription, { color: theme.colors.mutedText }]}>{feature.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Account Actions */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Account Actions</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {accountActions.map((action, index) => (
            <View key={index} style={[styles.actionItem, index === accountActions.length - 1 && { borderBottomWidth: 0 }]}>
              <ThemedIcon type={action.icon.type} name={action.icon.name} size={20} color={theme.colors.primary} style={styles.actionIcon} />
              <View style={styles.actionContent}>
                <ThemedText style={[styles.actionTitle, { color: theme.colors.text }]}>{action.title}</ThemedText>
                <ThemedText style={[styles.actionDescription, { color: theme.colors.mutedText }]}>{action.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Security Tips */}
        <View style={[styles.securityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <ThemedText style={[styles.securityTitle, { color: theme.colors.text }]}>Security Tips</ThemedText>
          <ThemedText style={[styles.securityDescription, { color: theme.colors.mutedText }]}>
            • Use a strong, unique password\n• Enable two-factor authentication\n• Keep your app updated\n• Never share your login credentials\n• Log out from shared devices
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
  topicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  topicIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicDescription: {
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  actionIcon: {
    marginRight: 16,
    width: 20,
    alignItems: 'center',
    marginTop: 2,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  securityCard: {
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
  securityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  securityDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
}) 