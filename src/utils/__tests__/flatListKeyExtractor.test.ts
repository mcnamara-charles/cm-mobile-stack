import { 
  createFlatListKey, 
  createContentHash, 
  isValidFlatListKey 
} from '../flatListKeyExtractor'
import { MessageWithAttachments } from '../../types/global'

describe('flatListKeyExtractor', () => {
  describe('createFlatListKey', () => {
    it('should create valid keys for date items', () => {
      const dateItem = {
        type: 'date' as const,
        date: '2024-01-15'
      }
      
      const key = createFlatListKey(dateItem, 0)
      expect(key).toBe('date-2024-01-15-0')
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle date items with missing date', () => {
      const dateItem = {
        type: 'date' as const,
        date: undefined
      }
      
      const key = createFlatListKey(dateItem, 0)
      expect(key).toBe('date-unknown-date-0-0')
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should create valid keys for message groups', () => {
      const messageGroup = {
        type: 'group' as const,
        messages: [{
          id: 'msg-123',
          content: 'Hello world',
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: []
        }]
      }
      
      const key = createFlatListKey(messageGroup, 0)
      expect(key).toMatch(/^group-msg-123-\d+-0$/)
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle optimistic messages with tempId', () => {
      const optimisticGroup = {
        type: 'group' as const,
        messages: [{
          id: 'temp_123',
          tempId: 'temp_123',
          content: 'Hello world',
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: [],
          isOptimistic: true,
          isSending: true
        }]
      }
      
      const key = createFlatListKey(optimisticGroup, 0)
      expect(key).toMatch(/^group-temp_123-\d+-0$/)
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle messages without ID using content hash', () => {
      const messageGroup = {
        type: 'group' as const,
        messages: [{
          id: 'temp_123', // Use temp ID instead of undefined
          content: 'Hello world',
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: []
        }]
      }
      
      const key = createFlatListKey(messageGroup, 0)
      expect(key).toMatch(/^group-temp_123-\d+-0$/)
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle messages without content', () => {
      const messageGroup = {
        type: 'group' as const,
        messages: [{
          id: 'msg-123',
          content: '', // Empty content instead of undefined
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: []
        }]
      }
      
      const key = createFlatListKey(messageGroup, 0)
      expect(key).toMatch(/^group-msg-123-\d+-0$/)
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle empty message groups', () => {
      const emptyGroup = {
        type: 'group' as const,
        messages: []
      }
      
      const key = createFlatListKey(emptyGroup, 0)
      expect(key).toBe('empty-group-0')
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle undefined messages array', () => {
      const undefinedGroup = {
        type: 'group' as const,
        messages: undefined
      }
      
      const key = createFlatListKey(undefinedGroup, 0)
      expect(key).toBe('empty-group-0')
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should handle invalid message groups', () => {
      const invalidGroup = {
        type: 'group' as const,
        messages: [null as any]
      }
      
      const key = createFlatListKey(invalidGroup, 0)
      expect(key).toBe('invalid-group-0')
      expect(isValidFlatListKey(key)).toBe(true)
    })

    it('should create unique keys for different indices', () => {
      const messageGroup = {
        type: 'group' as const,
        messages: [{
          id: 'msg-123',
          content: 'Hello world',
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: []
        }]
      }
      
      const key1 = createFlatListKey(messageGroup, 0)
      const key2 = createFlatListKey(messageGroup, 1)
      
      expect(key1).not.toBe(key2)
      expect(isValidFlatListKey(key1)).toBe(true)
      expect(isValidFlatListKey(key2)).toBe(true)
    })
  })

  describe('createContentHash', () => {
    it('should create hash from content', () => {
      expect(createContentHash('Hello world')).toBe('helloworl')
      expect(createContentHash('Test Message 123')).toBe('testmessa')
      expect(createContentHash('')).toBe('no-content')
    })

    it('should handle special characters', () => {
      expect(createContentHash('Hello! @#$%')).toBe('hello')
      expect(createContentHash('Test\n\r\t')).toBe('test')
    })

    it('should respect max length', () => {
      expect(createContentHash('Very long message content', 5)).toBe('very')
      expect(createContentHash('Short', 10)).toBe('short')
    })
  })

  describe('isValidFlatListKey', () => {
    it('should validate proper keys', () => {
      expect(isValidFlatListKey('date-2024-01-15-0')).toBe(true)
      expect(isValidFlatListKey('group-msg-123-1705315200000-0')).toBe(true)
      expect(isValidFlatListKey('empty-group-0')).toBe(true)
    })

    it('should reject invalid keys', () => {
      expect(isValidFlatListKey('')).toBe(false)
      expect(isValidFlatListKey('undefined')).toBe(false)
      expect(isValidFlatListKey('group-undefined-0')).toBe(false)
      expect(isValidFlatListKey('date-null-0')).toBe(false)
    })
  })
}) 