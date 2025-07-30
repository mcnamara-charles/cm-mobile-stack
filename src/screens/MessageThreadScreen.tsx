import { useRef, useState, useEffect } from 'react'
import {
  FlatList,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native'

import { useRoute, useNavigation } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/themeContext'
import {
  ThemedView,
  ThemedText,
} from '../components/themed'
import ImageLightbox from '../components/ImageLightbox'
import ImagePickerModal from '../components/ImagePickerModal'
import MessageThreadHeader from '../components/MessageThreadHeader'
import MessageGroup from '../components/MessageGroup'
import MessageThreadInputBar from '../components/MessageThreadInputBar'
import MessageThreadTypingIndicator from '../components/MessageThreadTypingIndicator'
import { format } from 'date-fns'
import { useMessageThread } from '../hooks/useMessageThread'
import { useMessageInput } from '../hooks/useMessageInput'
import { getFlatListItems, type FlatListItem } from '../utils/messageGrouping'
import { MessageThreadNavigationProp, MessageThreadRouteProp } from '../types/navigation'
import { User } from '../types/global'
import { useFadeAnimation } from '../hooks/animations'
import { createFlatListKey } from '../utils/flatListKeyExtractor'



export default function MessageThreadScreen() {
  const route = useRoute<MessageThreadRouteProp>()
  const navigation = useNavigation<MessageThreadNavigationProp>()
  const { user } = useAuth()
  const { theme } = useTheme()
  const flatListRef = useRef<FlatList>(null)
  const otherUserId = route.params.userId
  const { fadeAnim, fadeIn } = useFadeAnimation({
    onAnimationComplete: () => {
      // Animation completed callback if needed
    }
  })

  // Custom hooks for business logic
  const {
    messages,
    loading,
    otherUser,
    otherUserTyping,
    selectedAttachments,
    uploadingImages,
    showImagePickerModal,
    showLightbox,
    lightboxImages,
    lightboxCurrentIndex,
    handleSend,
    broadcastTyping,
    handleTakePhoto,
    handleChooseFromGallery,
    removeAttachment,
    clearAttachments,
    openLightbox,
    closeLightbox,
    openImagePicker,
    closeImagePicker,
  } = useMessageThread({
    currentUserId: user?.id || '',
    otherUserId: otherUserId || '',
    onMessagesLoaded: () => {
      // Fade in the content when loading is complete
      fadeIn()
    },
    onError: (error) => {
      console.error('Message thread error:', error)
    }
  })

  const {
    text,
    isInputFocused,
    showLeftIcons,
    handleTextChange,
    handleInputFocus,
    handleInputBlur,
    handleExpandButtonPress,
    clearText,
  } = useMessageInput({
    onTyping: broadcastTyping
  })

  // Local state for UI interactions
  const [showTimestamps, setShowTimestamps] = useState<Set<string>>(new Set())



  // Scroll to bottom when new messages arrive
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [messages.length])

  const toggleTimestamp = (messageId: string) => {
    setShowTimestamps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleSendMessage = async () => {
    try {
      await handleSend(text)
      clearText()
      clearAttachments()
    } catch (error) {
      // Error is already handled in the hook
    }
  }



  if (loading) {
    return (
      <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Loading Header */}
        <MessageThreadHeader otherUser={otherUser} loading={true} />

        {/* Loading Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.colors.mutedText, marginTop: 16 }]}>
              Loading conversation...
            </ThemedText>
          </View>
        </View>

        {/* Input Bar - Always visible even during loading */}
        <MessageThreadInputBar
          text=""
          onTextChange={() => {}}
          onSend={() => {}}
          onImagePicker={() => {}}
          onExpandButtonPress={() => {}}
          onInputFocus={() => {}}
          onInputBlur={() => {}}
          selectedAttachments={[]}
          onRemoveAttachment={() => {}}
          onClearAllAttachments={() => {}}
          uploadingImages={false}
          isInputFocused={false}
          showLeftIcons={true}
        />
      </ThemedView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <ThemedView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <MessageThreadHeader otherUser={otherUser} loading={loading} />
      </Animated.View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          ref={flatListRef}
          data={getFlatListItems(messages)}
          keyExtractor={createFlatListKey}
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                  {/* Date header */}
                  <View style={{ 
                    alignItems: 'center', 
                    paddingVertical: 24,
                    backgroundColor: theme.colors.card
                  }}>
                    <ThemedText style={[styles.dateLabel, { 
                      color: theme.colors.mutedText,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }]}>
                      {format(new Date(item.date || new Date()), 'EEEE, MMM do')}
                    </ThemedText>
                  </View>
                </View>
              )
            } else {
              return (
                <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
                  <MessageGroup
                    messages={item.messages || []}
                    otherUser={otherUser}
                    currentUserId={user?.id || ''}
                    showTimestamps={showTimestamps}
                    onToggleTimestamp={toggleTimestamp}
                    onImagePress={openLightbox}
                  />
                </View>
              )
            }
          }}
          inverted
          scrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingBottom: 60,
            flexGrow: 1,
            width: '100%',
            minHeight: '100%'
          }}
          style={{ flex: 1, width: '100%', backgroundColor: theme.colors.background }}
          ListFooterComponent={
            <View style={{ 
              height: 80, 
              width: '100%'
            }} />
          }
          ListHeaderComponent={
            <View style={{ 
              flex: 1,
              width: '100%'
            }} />
          }
          keyboardShouldPersistTaps="never"
          scrollEventThrottle={16}
          nestedScrollEnabled={false}
          removeClippedSubviews={false}
        />
        {/* Typing indicator */}
        <MessageThreadTypingIndicator 
          isTyping={otherUserTyping} 
          otherUserName={otherUser?.first_name} 
        />
      </Animated.View>

      {/* Input Bar */}
      <MessageThreadInputBar
        text={text}
        onTextChange={handleTextChange}
        onSend={handleSendMessage}
        onImagePicker={openImagePicker}
        onExpandButtonPress={handleExpandButtonPress}
        onInputFocus={handleInputFocus}
        onInputBlur={handleInputBlur}
        selectedAttachments={selectedAttachments}
        onRemoveAttachment={removeAttachment}
        onClearAllAttachments={clearAttachments}
        uploadingImages={uploadingImages}
        isInputFocused={isInputFocused}
        showLeftIcons={showLeftIcons}
      />

      {/* Custom Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePickerModal}
        onClose={closeImagePicker}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
        title="Add Image"
      />

      {/* Image Lightbox */}
      <ImageLightbox
        visible={showLightbox}
        onClose={closeLightbox}
        images={lightboxImages}
        initialIndex={lightboxCurrentIndex}
      />
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Loading styles
  loadingContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});