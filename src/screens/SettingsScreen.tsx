import React from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Switch,
  TouchableOpacity,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedIcon } from '../components/themed'
import { useTheme } from '../context/themeContext'

export default function SettingsScreen() {
  const navigation = useNavigation()
  const { theme } = useTheme()

  // Mock state for toggles (not functional)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false)

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }] }>
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
        <ThemedText style={[styles.headerText, { color: theme.colors.text } ]}>Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Account</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }] }>
          <SettingsRow icon={{ type: 'ionicons', name: 'person-outline' }} label="Profile" description="View and edit your personal information" />
          <SettingsRow icon={{ type: 'ionicons', name: 'mail-outline' }} label="Email" description="Manage your email address and notifications" />
          <SettingsRow icon={{ type: 'ionicons', name: 'key-outline' }} label="Change Password" description="Update your account password" isLast={true} />
        </View>

        {/* Security Section */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>Security</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }] }>
          <SettingsRow icon={{ type: 'ionicons', name: 'lock-closed-outline' }} label="Biometrics" description="Enable fingerprint or face unlock">
            <Switch value={biometricsEnabled} onValueChange={() => {}} />
          </SettingsRow>
          <SettingsRow icon={{ type: 'ionicons', name: 'shield-checkmark-outline' }} label="Two-Factor Authentication" value="Off" description="Add an extra layer of security to your account" isLast={true} />
        </View>

        {/* About Section */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>About</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }] }>
          <SettingsRow icon={{ type: 'ionicons', name: 'information-circle-outline' }} label="About App" description="Learn more about this application" />
          <SettingsRow icon={{ type: 'ionicons', name: 'document-text-outline' }} label="Terms of Service" description="Read our terms and conditions" />
          <SettingsRow icon={{ type: 'ionicons', name: 'shield-outline' }} label="Privacy Policy" description="How we protect your privacy" isLast={true} />
        </View>

        {/* Danger Zone */}
        <ThemedText style={[styles.sectionTitle, { color: theme.colors.danger }]}>Danger Zone</ThemedText>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.danger }]}> 
          <SettingsRow icon={{ type: 'ionicons', name: 'log-out-outline' }} label="Sign Out" labelStyle={{ color: theme.colors.danger }} iconColor={theme.colors.danger} description="Sign out of your account on this device" />
          <SettingsRow icon={{ type: 'ionicons', name: 'trash-outline' }} label="Delete Account" labelStyle={{ color: theme.colors.danger }} isLast={true} iconColor={theme.colors.danger} description="Permanently delete your account and data" />
        </View>
      </ScrollView>
    </ThemedView>
  )
}

function SettingsRow({ icon, label, value, children, labelStyle, isLast, iconColor, description }: any) {
  const { theme } = useTheme()
  return (
    <ThemedTouchableOpacity 
      style={[
        styles.row, 
        isLast && { borderBottomWidth: 0 }
      ]}
      activeOpacity={0.7}
    >
      <ThemedIcon type={icon.type} name={icon.name} size={24} color={iconColor || theme.colors.primary} style={styles.rowIcon} />
      <View style={styles.rowContent}>
        <ThemedText style={[styles.rowLabel, labelStyle]}>{label}</ThemedText>
        {description && <ThemedText style={[styles.rowDescription, { color: theme.colors.mutedText }]}>{description}</ThemedText>}
      </View>
      {value && <ThemedText style={[styles.rowValue, { color: theme.colors.primary }]}>{value}</ThemedText>}
      {children}
      {!children && !value && (
        <ThemedIcon type="ionicons" name="chevron-forward" size={18} color={theme.colors.mutedText} />
      )}
    </ThemedTouchableOpacity>
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
    // shadow for iOS
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    minHeight: 48,
  },
  rowIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
    marginRight: 12,
    fontWeight: '400',
  },
  rowDescription: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
})
