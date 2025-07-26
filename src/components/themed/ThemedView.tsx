import React from 'react'
import { View, ViewProps } from 'react-native'
import { useTheme } from '../../context/themeContext'

export const ThemedView = ({ style, children, ...props }: ViewProps & { children?: React.ReactNode }) => {
  const { theme } = useTheme()
  return <View style={[{ backgroundColor: theme.colors.background }, style]} {...props}>{children}</View>
}