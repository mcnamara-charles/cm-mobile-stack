import { useState, useCallback } from 'react'

interface UseMessageInputProps {
  onTextChange?: (text: string) => void
  onTyping?: () => void
}

export function useMessageInput({ onTextChange, onTyping }: UseMessageInputProps = {}) {
  const [text, setText] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showLeftIcons, setShowLeftIcons] = useState(true)

  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
    onTextChange?.(newText)
    
    if (newText.length > 0) {
      setShowLeftIcons(false)
      onTyping?.()
    }
  }, [onTextChange, onTyping])

  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true)
    setShowLeftIcons(false)
  }, [])

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false)
    setShowLeftIcons(true)
  }, [])

  const handleExpandButtonPress = useCallback(() => {
    setShowLeftIcons(true)
  }, [])

  const clearText = useCallback(() => {
    setText('')
  }, [])

  return {
    // State
    text,
    isInputFocused,
    showLeftIcons,
    
    // Actions
    handleTextChange,
    handleInputFocus,
    handleInputBlur,
    handleExpandButtonPress,
    clearText,
  }
} 