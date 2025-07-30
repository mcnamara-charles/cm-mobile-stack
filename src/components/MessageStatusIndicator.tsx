import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { ThemedIcon, ThemedText } from './themed'
import { useTheme } from '../context/themeContext'
import { MessageWithAttachments } from '../types/global'

interface MessageStatusIndicatorProps {
  message: MessageWithAttachments
  size?: number
}

export default function MessageStatusIndicator({ message, size = 12 }: MessageStatusIndicatorProps) {
  const { theme } = useTheme()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  // Don't show indicator for received messages
  if (!message.isOptimistic && !message.isSending && !message.sendError) {
    return null
  }

  // Animate status changes
  useEffect(() => {
    const animateStatusChange = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start()
    }

    // Animate when status changes
    if (message.isSending || message.sendError || (!message.isOptimistic && !message.isSending)) {
      animateStatusChange()
    }
  }, [message.isSending, message.sendError, message.isOptimistic, fadeAnim, scaleAnim])

  if (message.sendError) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ThemedIcon
          type="ionicons"
          name="alert-circle"
          size={size}
          color={theme.colors.danger || '#ff3b30'}
        />
      </Animated.View>
    )
  }

  if (message.isSending) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ThemedIcon
          type="ionicons"
          name="time-outline"
          size={size}
          color={theme.colors.mutedText}
        />
      </Animated.View>
    )
  }

  if (message.isOptimistic && !message.isSending) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ThemedIcon
          type="ionicons"
          name="checkmark-circle"
          size={size}
          color={theme.colors.primary}
        />
      </Animated.View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
}) 