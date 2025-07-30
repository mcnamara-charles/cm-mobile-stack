import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from './themed'
import { useTheme } from '../context/themeContext'

interface MessageThreadTypingIndicatorProps {
  isTyping: boolean
  otherUserName?: string
}

export default function MessageThreadTypingIndicator({ 
  isTyping, 
  otherUserName 
}: MessageThreadTypingIndicatorProps) {
  const { theme } = useTheme()

  if (!isTyping) return null

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 }}>
      <ThemedText style={[styles.typingText, { color: theme.colors.mutedText }]}>
        {otherUserName || 'User'} is typing...
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  typingText: {
    fontSize: 13,
  },
}) 