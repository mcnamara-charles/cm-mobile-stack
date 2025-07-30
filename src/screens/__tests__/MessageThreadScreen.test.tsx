import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import MessageThreadScreen from '../MessageThreadScreen'

// Mock the custom hooks
jest.mock('../../hooks/useMessageThread', () => ({
  useMessageThread: jest.fn(() => ({
    messages: [],
    loading: false,
    otherUser: { id: 'user2', first_name: 'John', last_name: 'Doe' },
    otherUserTyping: false,
    selectedAttachments: [],
    uploadingImages: false,
    showImagePickerModal: false,
    showLightbox: false,
    lightboxImages: [],
    lightboxCurrentIndex: 0,
    handleSend: jest.fn(),
    broadcastTyping: jest.fn(),
    handleTakePhoto: jest.fn(),
    handleChooseFromGallery: jest.fn(),
    removeAttachment: jest.fn(),
    clearAttachments: jest.fn(),
    openLightbox: jest.fn(),
    closeLightbox: jest.fn(),
    openImagePicker: jest.fn(),
    closeImagePicker: jest.fn(),
  })),
}))

jest.mock('../../hooks/useMessageInput', () => ({
  useMessageInput: jest.fn(() => ({
    text: '',
    isInputFocused: false,
    showLeftIcons: true,
    handleTextChange: jest.fn(),
    handleInputFocus: jest.fn(),
    handleInputBlur: jest.fn(),
    handleExpandButtonPress: jest.fn(),
    clearText: jest.fn(),
  })),
}))

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { userId: 'user2' } }),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

// Mock contexts
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user1', email: 'test@example.com' } }),
}))

jest.mock('../../context/themeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        text: '#000000',
        primary: '#007AFF',
        mutedText: '#8E8E93',
        card: '#F2F2F7',
        border: '#C6C6C8',
      },
    },
  }),
}))

// Mock components
jest.mock('../../components/MessageThreadHeader', () => 'MessageThreadHeader')
jest.mock('../../components/MessageGroup', () => 'MessageGroup')
jest.mock('../../components/MessageThreadInputBar', () => 'MessageThreadInputBar')
jest.mock('../../components/MessageThreadTypingIndicator', () => 'MessageThreadTypingIndicator')
jest.mock('../../components/ImageLightbox', () => 'ImageLightbox')
jest.mock('../../components/ImagePickerModal', () => 'ImagePickerModal')

describe('MessageThreadScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state correctly', () => {
    const { useMessageThread } = require('../../hooks/useMessageThread')
    useMessageThread.mockReturnValue({
      messages: [],
      loading: true,
      otherUser: null,
      otherUserTyping: false,
      selectedAttachments: [],
      uploadingImages: false,
      showImagePickerModal: false,
      showLightbox: false,
      lightboxImages: [],
      lightboxCurrentIndex: 0,
      handleSend: jest.fn(),
      broadcastTyping: jest.fn(),
      handleTakePhoto: jest.fn(),
      handleChooseFromGallery: jest.fn(),
      removeAttachment: jest.fn(),
      clearAttachments: jest.fn(),
      openLightbox: jest.fn(),
      closeLightbox: jest.fn(),
      openImagePicker: jest.fn(),
      closeImagePicker: jest.fn(),
    })

    const { getByText } = render(<MessageThreadScreen />)
    
    expect(getByText('Loading conversation...')).toBeTruthy()
  })

  it('should render main content when not loading', () => {
    const { getByTestId } = render(<MessageThreadScreen />)
    
    // Should render the main container
    expect(getByTestId('message-thread-container')).toBeTruthy()
  })

  it('should handle send message', async () => {
    const mockHandleSend = jest.fn()
    const { useMessageThread } = require('../../hooks/useMessageThread')
    const { useMessageInput } = require('../../hooks/useMessageInput')
    
    useMessageThread.mockReturnValue({
      messages: [],
      loading: false,
      otherUser: { id: 'user2', first_name: 'John', last_name: 'Doe' },
      otherUserTyping: false,
      selectedAttachments: [],
      uploadingImages: false,
      showImagePickerModal: false,
      showLightbox: false,
      lightboxImages: [],
      lightboxCurrentIndex: 0,
      handleSend: mockHandleSend,
      broadcastTyping: jest.fn(),
      handleTakePhoto: jest.fn(),
      handleChooseFromGallery: jest.fn(),
      removeAttachment: jest.fn(),
      clearAttachments: jest.fn(),
      openLightbox: jest.fn(),
      closeLightbox: jest.fn(),
      openImagePicker: jest.fn(),
      closeImagePicker: jest.fn(),
    })

    useMessageInput.mockReturnValue({
      text: 'Hello',
      isInputFocused: false,
      showLeftIcons: true,
      handleTextChange: jest.fn(),
      handleInputFocus: jest.fn(),
      handleInputBlur: jest.fn(),
      handleExpandButtonPress: jest.fn(),
      clearText: jest.fn(),
    })

    const { getByTestId } = render(<MessageThreadScreen />)
    
    const sendButton = getByTestId('send-button')
    fireEvent.press(sendButton)

    await waitFor(() => {
      expect(mockHandleSend).toHaveBeenCalledWith('Hello')
    })
  })

  it('should handle timestamp toggle', () => {
    const { getByTestId } = render(<MessageThreadScreen />)
    
    const timestampButton = getByTestId('timestamp-button-1')
    fireEvent.press(timestampButton)

    // Should toggle timestamp visibility
    expect(timestampButton).toBeTruthy()
  })

  it('should handle image picker modal', () => {
    const mockOpenImagePicker = jest.fn()
    const { useMessageThread } = require('../../hooks/useMessageThread')
    
    useMessageThread.mockReturnValue({
      messages: [],
      loading: false,
      otherUser: { id: 'user2', first_name: 'John', last_name: 'Doe' },
      otherUserTyping: false,
      selectedAttachments: [],
      uploadingImages: false,
      showImagePickerModal: false,
      showLightbox: false,
      lightboxImages: [],
      lightboxCurrentIndex: 0,
      handleSend: jest.fn(),
      broadcastTyping: jest.fn(),
      handleTakePhoto: jest.fn(),
      handleChooseFromGallery: jest.fn(),
      removeAttachment: jest.fn(),
      clearAttachments: jest.fn(),
      openLightbox: jest.fn(),
      closeLightbox: jest.fn(),
      openImagePicker: mockOpenImagePicker,
      closeImagePicker: jest.fn(),
    })

    const { getByTestId } = render(<MessageThreadScreen />)
    
    const imagePickerButton = getByTestId('image-picker-button')
    fireEvent.press(imagePickerButton)

    expect(mockOpenImagePicker).toHaveBeenCalled()
  })

  it('should handle lightbox operations', () => {
    const mockOpenLightbox = jest.fn()
    const { useMessageThread } = require('../../hooks/useMessageThread')
    
    useMessageThread.mockReturnValue({
      messages: [],
      loading: false,
      otherUser: { id: 'user2', first_name: 'John', last_name: 'Doe' },
      otherUserTyping: false,
      selectedAttachments: [],
      uploadingImages: false,
      showImagePickerModal: false,
      showLightbox: false,
      lightboxImages: [],
      lightboxCurrentIndex: 0,
      handleSend: jest.fn(),
      broadcastTyping: jest.fn(),
      handleTakePhoto: jest.fn(),
      handleChooseFromGallery: jest.fn(),
      removeAttachment: jest.fn(),
      clearAttachments: jest.fn(),
      openLightbox: mockOpenLightbox,
      closeLightbox: jest.fn(),
      openImagePicker: jest.fn(),
      closeImagePicker: jest.fn(),
    })

    const { getByTestId } = render(<MessageThreadScreen />)
    
    const imageButton = getByTestId('message-image-1')
    fireEvent.press(imageButton)

    expect(mockOpenLightbox).toHaveBeenCalled()
  })
}) 