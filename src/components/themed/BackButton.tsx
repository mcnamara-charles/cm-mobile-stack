import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ThemedIcon } from './ThemedIcon'
import { useTheme } from '../../context/themeContext'

interface BackButtonProps {
  onPress?: () => void
  style?: any
  iconName?: 'chevron-back' | 'arrow-back'
  size?: number
  color?: string
}

export const BackButton = ({ 
  onPress, 
  style, 
  iconName = 'chevron-back',
  size = 24,
  color
}: BackButtonProps) => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      navigation.goBack()
    }
  }

  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <ThemedIcon 
        type="ionicons" 
        name={iconName} 
        size={size} 
        color={color || theme.colors.text} 
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
}) 