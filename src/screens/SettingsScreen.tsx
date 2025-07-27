import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedView, ThemedText, ThemedTouchableOpacity, ThemedIcon } from '../components/themed'
import { useTheme } from '../context/themeContext'
import { useAuth } from '../context/AuthContext'

export default function SettingsScreen() {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { signOut } = useAuth()
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  // Mock state for toggles (not functional)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false)

  const handleSignOut = async () => {
    setShowSignOutModal(false)
    await signOut()
  }

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
          <SettingsRow 
            icon={{ type: 'ionicons', name: 'person-outline' }} 
            label="Profile" 
            description="View and edit your personal information" 
            onPress={() => navigation.navigate('Profile' as never)}
          />
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
          <SettingsRow 
            icon={{ type: 'ionicons', name: 'log-out-outline' }} 
            label="Sign Out" 
            labelStyle={{ color: theme.colors.danger }} 
            iconColor={theme.colors.danger} 
            description="Sign out of your account on this device"
            onPress={() => setShowSignOutModal(true)}
          />
          <SettingsRow icon={{ type: 'ionicons', name: 'trash-outline' }} label="Delete Account" labelStyle={{ color: theme.colors.danger }} isLast={true} iconColor={theme.colors.danger} description="Permanently delete your account and data" />
        </View>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowSignOutModal(false)}
        >
          <Pressable 
            style={[styles.modalContent, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <View style={[styles.modalIconContainer, { backgroundColor: theme.colors.danger + '15' }]}>
              <ThemedIcon 
                type="ionicons" 
                name="log-out-outline" 
                size={32} 
                color={theme.colors.danger} 
              />
            </View>

            {/* Title */}
            <ThemedText style={[styles.modalTitle, { color: theme.colors.text }]}>
              Sign Out
            </ThemedText>

            {/* Message */}
            <ThemedText style={[styles.modalMessage, { color: theme.colors.mutedText }]}>
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </ThemedText>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <ThemedTouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setShowSignOutModal(false)}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Cancel
                </ThemedText>
              </ThemedTouchableOpacity>

              <ThemedTouchableOpacity
                style={[styles.modalButton, styles.signOutButton, { backgroundColor: theme.colors.danger }]}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.signOutButtonText}>
                  Sign Out
                </ThemedText>
              </ThemedTouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  )
}

function SettingsRow({ icon, label, value, children, labelStyle, isLast, iconColor, description, onPress }: any) {
  const { theme } = useTheme()
  return (
    <ThemedTouchableOpacity 
      style={[
        styles.row, 
        isLast && { borderBottomWidth: 0 }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    minHeight: 64,
  },
  rowIcon: {
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  signOutButton: {
    // backgroundColor set inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
})
