// User types
export interface User {
  id: string
  email?: string
  first_name?: string
  last_name?: string
  profile_url?: string
  headline?: string
  bio?: string
  phone?: string
  address?: string
  banner_url?: string
  is_provider?: boolean
}

// Message types
export interface MessageAttachment {
  id?: string
  message_id?: string
  url: string
  type: 'image' | 'video' | 'file'
  created_at: string
  // Additional fields for file info
  file_url?: string
  file_name?: string
  file_type?: string
  file_size?: number
}

export interface MessageWithAttachments {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  created_at: string
  attachments: MessageAttachment[]
  read_at?: string
  // Optimistic message properties
  isOptimistic?: boolean
  isSending?: boolean
  sendError?: string
  tempId?: string
}

// Message status types
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'delivered' | 'read'

// Theme types
export interface AppTheme {
  colors: {
    background: string
    card: string
    primary: string
    mutedText: string
    text: string
    border: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export type ThemeName = 'light' | 'dark' | 'system' 