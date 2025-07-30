import React from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from './themed'
import { useTheme } from '../context/themeContext'
import { MessageAttachment } from '../services/api/messages'

interface MessageThreadInputBarProps {
  text: string
  onTextChange: (text: string) => void
  onSend: () => void
  onImagePicker: () => void
  onExpandButtonPress: () => void
  onInputFocus: () => void
  onInputBlur: () => void
  selectedAttachments: MessageAttachment[]
  onRemoveAttachment: (index: number) => void
  onClearAllAttachments: () => void
  uploadingImages: boolean
  isInputFocused: boolean
  showLeftIcons: boolean
}

export default function MessageThreadInputBar({
  text,
  onTextChange,
  onSend,
  onImagePicker,
  onExpandButtonPress,
  onInputFocus,
  onInputBlur,
  selectedAttachments,
  onRemoveAttachment,
  onClearAllAttachments,
  uploadingImages,
  isInputFocused,
  showLeftIcons,
}: MessageThreadInputBarProps) {
  const { theme } = useTheme()

  return (
    <>
      {/* Selected attachments preview */}
      {selectedAttachments.length > 0 && (
        <View style={[styles.attachmentsPreview, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.attachmentsPreviewHeader}>
            <ThemedText style={[styles.attachmentsPreviewTitle, { color: theme.colors.text }]}>
              {selectedAttachments.length} image{selectedAttachments.length > 1 ? 's' : ''} selected
            </ThemedText>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={onClearAllAttachments}
            >
              <ThemedText style={[styles.clearAllText, { color: theme.colors.primary }]}>
                Clear all
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.attachmentsPreviewList}>
            {selectedAttachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentPreviewItem}>
                <ThemedIcon
                  type="ionicons"
                  name="image"
                  size={24}
                  color={theme.colors.primary}
                />
                <TouchableOpacity
                  style={styles.removeAttachmentButton}
                  onPress={() => onRemoveAttachment(index)}
                  activeOpacity={0.8}
                >
                  <ThemedIcon
                    type="ionicons"
                    name="close-circle"
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, width: '100%' }]}>
        {/* Left Icons - Only show when not focused and showLeftIcons is true */}
        {showLeftIcons && (
          <View style={styles.leftIconsContainer}>
            <ThemedTouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <ThemedIcon
                type="ionicons"
                name="add-circle-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
            <ThemedTouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={onImagePicker}
            >
              <ThemedIcon
                type="ionicons"
                name="camera-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
            <ThemedTouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.7}
              onPress={onImagePicker}
            >
              <ThemedIcon
                type="ionicons"
                name="images-outline"
                size={24}
                color={theme.colors.primary}
              />
            </ThemedTouchableOpacity>
          </View>
        )}

        {/* Expand Button - Only show when focused and left icons are hidden */}
        {isInputFocused && !showLeftIcons && (
          <ThemedTouchableOpacity
            style={styles.expandButton}
            onPress={onExpandButtonPress}
            activeOpacity={0.7}
          >
            <ThemedIcon
              type="ionicons"
              name="chevron-forward"
              size={20}
              color={theme.colors.primary}
            />
          </ThemedTouchableOpacity>
        )}

        <TextInput
          style={[
            styles.textInput,
            { color: theme.colors.text },
            { flex: 1, minWidth: 120, maxWidth: '100%' } // Always flex, constrained width
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.mutedText}
          value={text}
          onChangeText={onTextChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          multiline
          maxLength={1000}
        />

        {/* Send Button - Only show when there's text, attachments, or input is focused */}
        {(text.trim() || selectedAttachments.length > 0 || isInputFocused) && (
          <ThemedTouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: (text.trim() || selectedAttachments.length > 0) ? theme.colors.primary : theme.colors.border,
                opacity: uploadingImages ? 0.7 : 1,
              },
            ]}
            onPress={onSend}
            activeOpacity={0.8}
            disabled={!text.trim() && selectedAttachments.length === 0 || uploadingImages}
          >
            {uploadingImages ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedIcon
                type="ionicons"
                name="send"
                size={20}
                color={(text.trim() || selectedAttachments.length > 0) ? '#fff' : theme.colors.mutedText}
              />
            )}
          </ThemedTouchableOpacity>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  leftIconsContainer: {
    flexDirection: 'row',
    marginRight: 12,
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  expandButton: {
    padding: 4,
    marginRight: 4,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    minWidth: 120,
    maxWidth: '100%',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
    width: '100%',
    maxWidth: '100%',
  },
  attachmentsPreview: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  attachmentsPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentsPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentsPreviewList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  attachmentPreviewItem: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -7,
    right: -7,
    backgroundColor: 'rgba(0, 0, 0, 0.29)',
    borderRadius: 10,
  },
}) 