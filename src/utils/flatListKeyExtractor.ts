import { MessageWithAttachments } from '../types/global'

interface FlatListItem {
  type: 'date' | 'group'
  date?: string
  messages?: MessageWithAttachments[]
}

/**
 * Creates a robust key for FlatList items that handles all edge cases
 */
export function createFlatListKey(item: FlatListItem, index: number): string {
  if (item.type === 'date') {
    // Ensure date has a fallback
    const dateKey = item.date || `unknown-date-${index}`
    return `date-${dateKey}-${index}`
  } else {
    // Handle message groups with robust fallbacks
    if (!item.messages || item.messages.length === 0) {
      return `empty-group-${index}`
    }
    
    const firstMessage = item.messages[0]
    if (!firstMessage) {
      return `invalid-group-${index}`
    }
    
    // Use tempId if available (for optimistic messages), otherwise use id
    const messageId = firstMessage.tempId || firstMessage.id
    
    // Ensure we have a valid ID, with multiple fallbacks
    if (!messageId) {
      // Fallback to content hash if no ID
      const contentHash = firstMessage.content 
        ? firstMessage.content.slice(0, 10).replace(/\s+/g, '') 
        : 'no-content'
      return `group-content-${contentHash}-${index}`
    }
    
    // Use timestamp as additional uniqueness
    const timestamp = firstMessage.created_at 
      ? new Date(firstMessage.created_at).getTime() 
      : Date.now()
    
    return `group-${messageId}-${timestamp}-${index}`
  }
}

/**
 * Creates a simple hash from a string for fallback IDs
 */
export function createContentHash(content: string, maxLength: number = 10): string {
  if (!content) return 'no-content'
  
  return content
    .slice(0, maxLength)
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

/**
 * Validates if a key is properly formatted
 */
export function isValidFlatListKey(key: string): boolean {
  return Boolean(key && 
         typeof key === 'string' && 
         key.length > 0 && 
         !key.includes('undefined') && 
         !key.includes('null'))
} 