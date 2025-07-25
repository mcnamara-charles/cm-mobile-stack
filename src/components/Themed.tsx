import React from 'react'
import {
  View,
  Text,
  ViewProps,
  TextProps,
  StyleSheet,
  ViewStyle,
  Image,
  TouchableOpacity,
  ImageProps,
  TouchableOpacityProps,
} from 'react-native'
import { useTheme } from '../context/themeContext'

export const ThemedView = ({ style, children, ...props }: ViewProps & { children?: React.ReactNode }) => {
  const { theme } = useTheme()
  return <View style={[{ backgroundColor: theme.colors.background }, style]} {...props}>{children}</View>
}

export const ThemedText = ({ style, children, ...props }: TextProps & { children?: React.ReactNode }) => {
  const { theme } = useTheme()
  return <Text style={[{ color: theme.colors.text }, style]} {...props}>{children}</Text>
}

export const ThemedInputWrapper = ({ style, children }: { style?: ViewStyle; children: React.ReactNode }) => {
  const { theme } = useTheme()
  return (
    <View style={[styles.wrapper, {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    }, style]}>
      {children}
    </View>
  )
}

export const ThemedImage = ({ style, ...props }: ImageProps) => {
  return <Image style={style} {...props} />
}

export const ThemedTouchableOpacity = ({ style, ...props }: TouchableOpacityProps) => {
  return <TouchableOpacity style={style} activeOpacity={0.8} {...props} />
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingRight: 0,
    marginBottom: 14,
  },
})
