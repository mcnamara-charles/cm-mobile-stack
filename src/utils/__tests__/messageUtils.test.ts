import { 
  createOptimisticMessage, 
  markMessageAsSent, 
  markMessageAsFailed,
  generateTempId,
  isOptimisticMessage,
  isMessageSending,
  isMessageFailed
} from '../messageUtils'
import { MessageWithAttachments, MessageAttachment } from '../../types/global'

describe('messageUtils', () => {
  describe('generateTempId', () => {
    it('should generate unique temporary IDs', () => {
      const id1 = generateTempId()
      const id2 = generateTempId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^temp_\d+_[a-z0-9]+$/)
    })
  })

  describe('createOptimisticMessage', () => {
    it('should create an optimistic message with correct properties', () => {
      const message = createOptimisticMessage(
        'Hello world',
        'user1',
        'user2',
        []
      )

      expect(message.content).toBe('Hello world')
      expect(message.sender_id).toBe('user1')
      expect(message.recipient_id).toBe('user2')
      expect(message.isOptimistic).toBe(true)
      expect(message.isSending).toBe(true)
      expect(message.tempId).toBeDefined()
      expect(message.id).toBe(message.tempId)
    })

    it('should handle attachments correctly', () => {
      const attachments: MessageAttachment[] = [
        {
          url: 'file://test.jpg',
          type: 'image',
          created_at: new Date().toISOString()
        }
      ]

      const message = createOptimisticMessage(
        'Hello world',
        'user1',
        'user2',
        attachments
      )

      expect(message.attachments).toEqual(attachments)
    })
  })

  describe('markMessageAsSent', () => {
    it('should update optimistic message to sent state', () => {
      const optimisticMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isOptimistic: true,
        isSending: true,
        tempId: 'temp_123'
      }

      const realMessage: MessageWithAttachments = {
        id: 'real_456',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: []
      }

      const messages = [optimisticMessage]
      const updatedMessages = markMessageAsSent(messages, 'temp_123', realMessage)

      expect(updatedMessages).toHaveLength(1)
      expect(updatedMessages[0].id).toBe('real_456')
      expect(updatedMessages[0].isOptimistic).toBe(false)
      expect(updatedMessages[0].isSending).toBe(false)
      expect(updatedMessages[0].tempId).toBeUndefined()
    })
  })

  describe('markMessageAsFailed', () => {
    it('should mark optimistic message as failed', () => {
      const optimisticMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isOptimistic: true,
        isSending: true,
        tempId: 'temp_123'
      }

      const messages = [optimisticMessage]
      const updatedMessages = markMessageAsFailed(messages, 'temp_123', 'Network error')

      expect(updatedMessages).toHaveLength(1)
      expect(updatedMessages[0].isSending).toBe(false)
      expect(updatedMessages[0].sendError).toBe('Network error')
      expect(updatedMessages[0].isOptimistic).toBe(true) // Still optimistic until retry
    })
  })

  describe('message status checks', () => {
    it('should correctly identify optimistic messages', () => {
      const optimisticMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isOptimistic: true,
        isSending: true,
        tempId: 'temp_123'
      }

      const regularMessage: MessageWithAttachments = {
        id: 'real_456',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: []
      }

      expect(isOptimisticMessage(optimisticMessage)).toBe(true)
      expect(isOptimisticMessage(regularMessage)).toBe(false)
    })

    it('should correctly identify sending messages', () => {
      const sendingMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isSending: true
      }

      const sentMessage: MessageWithAttachments = {
        id: 'real_456',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isSending: false
      }

      expect(isMessageSending(sendingMessage)).toBe(true)
      expect(isMessageSending(sentMessage)).toBe(false)
    })

    it('should correctly identify failed messages', () => {
      const failedMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        sendError: 'Network error'
      }

      const successfulMessage: MessageWithAttachments = {
        id: 'real_456',
        content: 'Hello',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: []
      }

      expect(isMessageFailed(failedMessage)).toBe(true)
      expect(isMessageFailed(successfulMessage)).toBe(false)
    })
  })

  describe('realtime integration', () => {
    it('should match optimistic messages with realtime messages', () => {
      const optimisticMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello world',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isOptimistic: true,
        isSending: true,
        tempId: 'temp_123'
      }

      const realtimeMessage: MessageWithAttachments = {
        id: 'real_456',
        content: 'Hello world',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: []
      }

      // Simulate the matching logic from useMessageThread
      const isMatching = 
        optimisticMessage.isOptimistic && 
        optimisticMessage.content === realtimeMessage.content &&
        optimisticMessage.sender_id === realtimeMessage.sender_id &&
        optimisticMessage.recipient_id === realtimeMessage.recipient_id &&
        Math.abs(new Date(optimisticMessage.created_at).getTime() - new Date(realtimeMessage.created_at).getTime()) < 5000

      expect(isMatching).toBe(true)
    })

    it('should not match messages with different content', () => {
      const optimisticMessage: MessageWithAttachments = {
        id: 'temp_123',
        content: 'Hello world',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: [],
        isOptimistic: true,
        isSending: true,
        tempId: 'temp_123'
      }

      const realtimeMessage: MessageWithAttachments = {
        id: 'real_456',
        content: 'Different content',
        sender_id: 'user1',
        recipient_id: 'user2',
        created_at: new Date().toISOString(),
        attachments: []
      }

      const isMatching = 
        optimisticMessage.isOptimistic && 
        optimisticMessage.content === realtimeMessage.content &&
        optimisticMessage.sender_id === realtimeMessage.sender_id &&
        optimisticMessage.recipient_id === realtimeMessage.recipient_id &&
        Math.abs(new Date(optimisticMessage.created_at).getTime() - new Date(realtimeMessage.created_at).getTime()) < 5000

      expect(isMatching).toBe(false)
    })
  })
}) 