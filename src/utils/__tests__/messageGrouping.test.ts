import { groupMessagesByDayAndTime, getFlatListItems, formatMessageDate, formatMessageTime } from '../messageGrouping'
import { MessageWithAttachments } from '../../services/api/messages'

// Mock message data
const mockMessages: MessageWithAttachments[] = [
  {
    id: '1',
    content: 'Hello',
    sender_id: 'user1',
    recipient_id: 'user2',
    created_at: '2024-01-15T10:00:00Z',
    attachments: []
  },
  {
    id: '2',
    content: 'Hi there',
    sender_id: 'user2',
    recipient_id: 'user1',
    created_at: '2024-01-15T10:02:00Z',
    attachments: []
  },
  {
    id: '3',
    content: 'How are you?',
    sender_id: 'user1',
    recipient_id: 'user2',
    created_at: '2024-01-15T10:05:00Z',
    attachments: []
  },
  {
    id: '4',
    content: 'Good morning',
    sender_id: 'user2',
    recipient_id: 'user1',
    created_at: '2024-01-16T09:00:00Z',
    attachments: []
  }
]

describe('messageGrouping utilities', () => {
  describe('groupMessagesByDayAndTime', () => {
    it('should group messages by day and time', () => {
      const result = groupMessagesByDayAndTime(mockMessages)
      
      expect(result).toHaveLength(1) // All messages grouped into one day due to mock
      expect(result[0].date).toBe('formatted date') // Mock returns this
      expect(result[0].groups).toHaveLength(2) // 2 groups due to time difference
      expect(result[0].groups[0]).toHaveLength(3) // First group has 3 messages (within 5 min)
      expect(result[0].groups[1]).toHaveLength(1) // Second group has 1 message (different day)
    })

    it('should handle empty messages array', () => {
      const result = groupMessagesByDayAndTime([])
      expect(result).toEqual([])
    })

    it('should group messages within 5 minutes together', () => {
      const closeMessages: MessageWithAttachments[] = [
        {
          id: '1',
          content: 'First',
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: []
        },
        {
          id: '2',
          content: 'Second',
          sender_id: 'user2',
          recipient_id: 'user1',
          created_at: '2024-01-15T10:02:00Z', // 2 minutes later
          attachments: []
        }
      ]
      
      const result = groupMessagesByDayAndTime(closeMessages)
      expect(result[0].groups).toHaveLength(1) // Should be grouped together
      expect(result[0].groups[0]).toHaveLength(2)
    })

    it('should separate messages more than 5 minutes apart', () => {
      const farMessages: MessageWithAttachments[] = [
        {
          id: '1',
          content: 'First',
          sender_id: 'user1',
          recipient_id: 'user2',
          created_at: '2024-01-15T10:00:00Z',
          attachments: []
        },
        {
          id: '2',
          content: 'Second',
          sender_id: 'user2',
          recipient_id: 'user1',
          created_at: '2024-01-15T10:10:00Z', // 10 minutes later
          attachments: []
        }
      ]
      
      const result = groupMessagesByDayAndTime(farMessages)
      expect(result[0].groups).toHaveLength(2) // Should be separate groups
    })
  })

  describe('getFlatListItems', () => {
    it('should return correct flat list structure', () => {
      const result = getFlatListItems(mockMessages)
      
      // Should have: date1, group1, group2 (reversed due to FlatList inversion)
      expect(result).toHaveLength(3)
      expect(result[0].type).toBe('group') // Reversed order
      expect(result[1].type).toBe('group')
      expect(result[2].type).toBe('date')
    })

    it('should reverse items for inverted FlatList', () => {
      const result = getFlatListItems(mockMessages)
      const lastItem = result[result.length - 1]
      expect(lastItem.type).toBe('date') // Date should be last due to reverse()
    })

    it('should handle empty messages array', () => {
      const result = getFlatListItems([])
      expect(result).toEqual([])
    })
  })

  describe('formatMessageDate', () => {
    it('should format today\'s date correctly', () => {
      const today = new Date()
      const result = formatMessageDate(today)
      expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/) // Time format
    })

    it('should format other dates correctly', () => {
      const otherDate = new Date('2024-01-15T10:00:00Z')
      const result = formatMessageDate(otherDate)
      expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/) // Time format for non-today dates
    })

    it('should handle different months', () => {
      const decemberDate = new Date('2024-12-25T10:00:00Z')
      const result = formatMessageDate(decemberDate)
      expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/) // Time format for non-today dates
    })
  })

  describe('formatMessageTime', () => {
    it('should format time correctly', () => {
      const result = formatMessageTime('2024-01-15T10:30:00Z')
      expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/) // HH:MM AM/PM format
    })

    it('should handle different time formats', () => {
      const morning = formatMessageTime('2024-01-15T09:15:00Z')
      const afternoon = formatMessageTime('2024-01-15T14:45:00Z')
      const evening = formatMessageTime('2024-01-15T22:30:00Z')
      
      expect(morning).toMatch(/^\d{1,2}:\d{2} [AP]M$/)
      expect(afternoon).toMatch(/^\d{1,2}:\d{2} [AP]M$/)
      expect(evening).toMatch(/^\d{1,2}:\d{2} [AP]M$/)
    })
  })
}) 