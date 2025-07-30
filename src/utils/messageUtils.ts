import { MessageWithAttachments, MessageAttachment } from '../types/global'

/**
 * Generate a temporary ID for optimistic messages
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

/**
 * Create an optimistic message that will be shown immediately
 */
export function createOptimisticMessage(
  content: string,
  senderId: string,
  recipientId: string,
  attachments: MessageAttachment[] = []
): MessageWithAttachments {
  const tempId = generateTempId()
  return {
    id: tempId, // Use same ID as tempId for consistency
    content,
    sender_id: senderId,
    recipient_id: recipientId,
    created_at: new Date().toISOString(),
    attachments: attachments || [],
    isOptimistic: true,
    isSending: true,
    tempId: tempId,
  }
}

/**
 * Mark an optimistic message as sent successfully
 */
export function markMessageAsSent(
  messages: MessageWithAttachments[],
  tempId: string,
  realMessage: MessageWithAttachments
): MessageWithAttachments[] {
  return messages.map(message => 
    message.tempId === tempId 
      ? { 
          ...message, // Keep the optimistic message structure
          id: realMessage.id, // Update with real ID
          isOptimistic: false, // Mark as no longer optimistic
          isSending: false, // Mark as sent
          tempId: undefined, // Remove temp ID
        }
      : message
  )
}

/**
 * Mark an optimistic message as failed
 */
export function markMessageAsFailed(
  messages: MessageWithAttachments[],
  tempId: string,
  error: string
): MessageWithAttachments[] {
  return messages.map(message => 
    message.tempId === tempId 
      ? { ...message, isSending: false, sendError: error }
      : message
  )
}

/**
 * Remove an optimistic message (for retry scenarios)
 */
export function removeOptimisticMessage(
  messages: MessageWithAttachments[],
  tempId: string
): MessageWithAttachments[] {
  return messages.filter(message => message.tempId !== tempId)
}

/**
 * Check if a message is optimistic (temporary)
 */
export function isOptimisticMessage(message: MessageWithAttachments): boolean {
  return message.isOptimistic === true
}

/**
 * Check if a message is currently sending
 */
export function isMessageSending(message: MessageWithAttachments): boolean {
  return message.isSending === true
}

/**
 * Check if a message failed to send
 */
export function isMessageFailed(message: MessageWithAttachments): boolean {
  return message.sendError !== undefined
} 