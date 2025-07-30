import { useMessageThread } from '../useMessageThread'
import { MessageWithAttachments, MessageAttachment } from '../../services/api/messages'

// Mock dependencies
jest.mock('../../services/api/messages', () => ({
  fetchMessagesBetween: jest.fn(() => Promise.resolve([])),
  sendMessage: jest.fn(() => Promise.resolve({ id: 'test-message-id' })),
  markIncomingMessagesAsRead: jest.fn(() => Promise.resolve()),
  pickImage: jest.fn(() => Promise.resolve('file://test-image.jpg')),
  takePhoto: jest.fn(() => Promise.resolve('file://test-photo.jpg')),
  uploadImageAttachment: jest.fn(() => Promise.resolve({ url: 'https://test.com/image.jpg' })),
  testAttachmentsTable: jest.fn(() => Promise.resolve()),
  testStorageBucket: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
      send: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}))

jest.mock('../../context/MessageRealtimeContext', () => ({
  useRealtimeMessages: jest.fn(() => ({
    latestMessage: null,
  })),
}))

jest.mock('../../utils/getTypingChannelName', () => ({
  getTypingChannelName: jest.fn(() => 'test-typing-channel'),
}))

describe('useMessageThread', () => {
  const mockProps = {
    currentUserId: 'user1',
    otherUserId: 'user2',
    onMessagesLoaded: jest.fn(),
    onOtherUserLoaded: jest.fn(),
    onError: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export the hook function', () => {
    expect(useMessageThread).toBeDefined()
    expect(typeof useMessageThread).toBe('function')
  })

  it('should accept the required props', () => {
    expect(() => useMessageThread(mockProps)).not.toThrow()
  })

  it('should handle missing user IDs gracefully', () => {
    const propsWithoutIds = {
      currentUserId: '',
      otherUserId: '',
      onMessagesLoaded: jest.fn(),
      onOtherUserLoaded: jest.fn(),
      onError: jest.fn(),
    }
    
    expect(() => useMessageThread(propsWithoutIds)).not.toThrow()
  })

  it('should handle error callbacks', () => {
    const onError = jest.fn()
    const propsWithError = {
      ...mockProps,
      onError,
    }
    
    expect(() => useMessageThread(propsWithError)).not.toThrow()
  })

  it('should handle success callbacks', () => {
    const onMessagesLoaded = jest.fn()
    const onOtherUserLoaded = jest.fn()
    const propsWithCallbacks = {
      ...mockProps,
      onMessagesLoaded,
      onOtherUserLoaded,
    }
    
    expect(() => useMessageThread(propsWithCallbacks)).not.toThrow()
  })
}) 