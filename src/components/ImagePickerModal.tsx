import React from 'react'
import {
  Modal,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import { ThemedIcon, ThemedText } from './themed'
import { useTheme } from '../context/themeContext'

interface ImagePickerModalProps {
  visible: boolean
  onClose: () => void
  onTakePhoto: () => void
  onChooseFromGallery: () => void
  title?: string
}

export default function ImagePickerModal({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
  title = 'Add Image'
}: ImagePickerModalProps) {
  const { theme } = useTheme()

  const handleTakePhoto = () => {
    onClose()
    onTakePhoto()
  }

  const handleChooseFromGallery = () => {
    onClose()
    onChooseFromGallery()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <ThemedIcon
                type="ionicons"
                name="close"
                size={20}
                color={theme.colors.mutedText}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalOptions}>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.colors.background }]}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={styles.modalOptionIcon}>
                <ThemedIcon
                  type="ionicons"
                  name="camera"
                  size={28}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.modalOptionTextContainer}>
                <ThemedText style={[styles.modalOptionTitle, { color: theme.colors.text }]}>
                  Take Photo
                </ThemedText>
                <ThemedText style={[styles.modalOptionSubtitle, { color: theme.colors.mutedText }]}>
                  Use your camera
                </ThemedText>
              </View>
              <ThemedIcon
                type="ionicons"
                name="chevron-forward"
                size={20}
                color={theme.colors.mutedText}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.colors.background }]}
              onPress={handleChooseFromGallery}
              activeOpacity={0.8}
            >
              <View style={styles.modalOptionIcon}>
                <ThemedIcon
                  type="ionicons"
                  name="images"
                  size={28}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.modalOptionTextContainer}>
                <ThemedText style={[styles.modalOptionTitle, { color: theme.colors.text }]}>
                  Choose from Gallery
                </ThemedText>
                <ThemedText style={[styles.modalOptionSubtitle, { color: theme.colors.mutedText }]}>
                  Select one or multiple photos
                </ThemedText>
              </View>
              <ThemedIcon
                type="ionicons"
                name="chevron-forward"
                size={20}
                color={theme.colors.mutedText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
}) 