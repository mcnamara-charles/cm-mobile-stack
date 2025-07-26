import React from 'react'
import { Text, TextProps } from 'react-native'
import { useTheme } from '../../context/themeContext'

export const ThemedText = ({ style, children, ...props }: TextProps & { children?: React.ReactNode }) => {
  const { theme } = useTheme()
  return <Text style={[{ color: theme.colors.text }, style]} {...props}>{children}</Text>
}