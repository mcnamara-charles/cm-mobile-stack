import React, { useState } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  Modal,
  Pressable,
  Switch,
  ScrollView,
  StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedIcon, BackButton } from '../components/themed'
import { useTheme } from '../context/themeContext'
import { ThemedView, ThemedText } from '../components/themed'

export default function PreferencesScreen() {
  const navigation = useNavigation()
  const { themeOverride, theme, setTheme } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  // State for various preferences
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [largeText, setLargeText] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  const themeOptions = [
    { label: 'Light', value: 'light', icon: 'sunny-outline' },
    { label: 'Dark', value: 'dark', icon: 'moon-outline' },
    { label: 'System', value: 'system', icon: 'settings-outline' },
  ]

  const languageOptions = [
    { label: 'English', value: 'en', flag: '🇺🇸' },
    { label: 'Spanish', value: 'es', flag: '🇪🇸' },
    { label: 'French', value: 'fr', flag: '🇫🇷' },
    { label: 'German', value: 'de', flag: '🇩🇪' },
    { label: 'Chinese', value: 'zh', flag: '🇨🇳' },
  ]

  const selectedThemeLabel = themeOptions.find(o => o.value === themeOverride)?.label
  const selectedLanguageLabel = languageOptions.find(o => o.value === selectedLanguage)?.label

  const openModal = (modalType: string) => {
    setActiveModal(modalType)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setActiveModal(null)
  }

  const getCurrentOptions = () => {
    switch (activeModal) {
      case 'theme':
        return themeOptions
      case 'language':
        return languageOptions
      default:
        return []
    }
  }

  const handleOptionSelect = (value: string) => {
    if (activeModal === 'theme') {
      setTheme(value as any)
    } else if (activeModal === 'language') {
      setSelectedLanguage(value)
    }
    closeModal()
  }

  const getSelectedValue = () => {
    switch (activeModal) {
      case 'theme':
        return themeOverride
      case 'language':
        return selectedLanguage
      default:
        return ''
    }
  }

  const PreferenceRow = ({ 
    icon, 
    label, 
    description, 
    selectedText, 
    onPress, 
    isSwitch = false, 
    switchValue, 
    onSwitchChange,
    isLast = false 
  }: any) => {
    const { theme } = useTheme()
    
    return (
      <TouchableOpacity
        style={[
          styles.preferenceRow,
          { borderBottomColor: theme.colors.border },
          isLast && { borderBottomWidth: 0 }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={isSwitch}
      >
        <ThemedIcon 
          type="ionicons" 
          name={icon} 
          size={22} 
          color={theme.colors.primary} 
          style={styles.rowIcon} 
        />
        <View style={styles.rowContent}>
          <ThemedText style={[styles.rowLabel, { color: theme.colors.text }]}>
            {label}
          </ThemedText>
          {description && (
            <ThemedText style={[styles.rowDescription, { color: theme.colors.mutedText }]}>
              {description}
            </ThemedText>
          )}
          {selectedText && (
            <ThemedText style={[styles.selectedText, { color: theme.colors.primary }]}>
              {selectedText}
            </ThemedText>
          )}
        </View>
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ 
              false: theme.colors.border, 
              true: `${theme.colors.primary}40` 
            }}
            thumbColor={switchValue ? theme.colors.primary : theme.colors.mutedText}
            ios_backgroundColor={theme.colors.border}
          />
        ) : (
          <ThemedIcon 
            type="ionicons" 
            name="chevron-forward" 
            size={16} 
            color={theme.colors.mutedText} 
          />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar 
        barStyle={themeOverride === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border 
      }]}>
        <BackButton iconName="arrow-back" />
        <ThemedText style={[styles.headerTitle, { color: theme.colors.text }]}>
          Preferences
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Display Preferences */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>
            DISPLAY
          </ThemedText>
          <View style={[styles.card, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }]}>
            <PreferenceRow
              icon="color-palette-outline"
              label="Theme"
              description="Choose your preferred color scheme"
              selectedText={`Selected: ${selectedThemeLabel}`}
              onPress={() => openModal('theme')}
            />
            <PreferenceRow
              icon="language-outline"
              label="Language"
              description="Select your preferred language"
              selectedText={`Selected: ${selectedLanguageLabel}`}
              onPress={() => openModal('language')}
              isLast={true}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>
            NOTIFICATIONS
          </ThemedText>
          <View style={[styles.card, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }]}>
            <PreferenceRow
              icon="notifications-outline"
              label="Push Notifications"
              description="Receive notifications for important updates"
              isSwitch={true}
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
            <PreferenceRow
              icon="volume-high-outline"
              label="Sound"
              description="Play sounds for notifications"
              isSwitch={true}
              switchValue={soundEnabled}
              onSwitchChange={setSoundEnabled}
            />
            <PreferenceRow
              icon="phone-portrait-outline"
              label="Vibration"
              description="Vibrate for notifications"
              isSwitch={true}
              switchValue={vibrationEnabled}
              onSwitchChange={setVibrationEnabled}
              isLast={true}
            />
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.colors.mutedText }]}>
            ACCESSIBILITY
          </ThemedText>
          <View style={[styles.card, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border
          }]}>
            <PreferenceRow
              icon="text-outline"
              label="Large Text"
              description="Increase text size for better readability"
              isSwitch={true}
              switchValue={largeText}
              onSwitchChange={setLargeText}
            />
            <PreferenceRow
              icon="eye-outline"
              label="High Contrast"
              description="Increase contrast for better visibility"
              isSwitch={true}
              switchValue={highContrast}
              onSwitchChange={setHighContrast}
            />
            <PreferenceRow
              icon="pause-outline"
              label="Reduce Motion"
              description="Minimize animations and transitions"
              isSwitch={true}
              switchValue={reduceMotion}
              onSwitchChange={setReduceMotion}
              isLast={true}
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Enhanced Modal */}
      <Modal 
        visible={modalVisible} 
        transparent 
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={closeModal}
        >
          <Pressable 
            style={[styles.modalContent, { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border
            }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                {activeModal === 'theme' ? 'Choose Theme' : 'Select Language'}
              </ThemedText>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <ThemedIcon 
                  type="ionicons" 
                  name="close" 
                  size={24} 
                  color={theme.colors.mutedText} 
                />
              </TouchableOpacity>
            </View>
            
            {getCurrentOptions().map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  { borderBottomColor: theme.colors.border },
                  index === getCurrentOptions().length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => handleOptionSelect(option.value)}
                activeOpacity={0.7}
              >
                                 <View style={styles.modalOptionContent}>
                   {activeModal === 'theme' ? (
                     <ThemedIcon 
                       type="ionicons" 
                       name={(option as any).icon} 
                       size={20} 
                       color={theme.colors.primary} 
                     />
                   ) : (
                     <ThemedText style={styles.flagEmoji}>{(option as any).flag}</ThemedText>
                   )}
                  <ThemedText style={[
                    styles.modalOptionText, 
                    { color: theme.colors.text },
                    option.value === getSelectedValue() && { 
                      color: theme.colors.primary,
                      fontWeight: '600' 
                    }
                  ]}>
                    {option.label}
                  </ThemedText>
                </View>
                {option.value === getSelectedValue() && (
                  <ThemedIcon 
                    type="ionicons" 
                    name="checkmark" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
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
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    marginHorizontal: 24,
    letterSpacing: 1,
  },
  card: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 64,
    borderBottomWidth: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  flagEmoji: {
    fontSize: 20,
  },
  selectedText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
})
