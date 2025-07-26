import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { useTheme } from '../../context/themeContext'

export const ThemedInputWrapper = ({ style, children }: { style?: ViewStyle; children: React.ReactNode }) => {
  const { theme } = useTheme()
  return (
    <View style={[
      styles.wrapper,
      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      style
    ]}>
      {children}
    </View>
  )
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