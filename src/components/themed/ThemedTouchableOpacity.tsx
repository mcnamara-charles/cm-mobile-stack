import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

export const ThemedTouchableOpacity = ({ style, ...props }: TouchableOpacityProps) => {
  return <TouchableOpacity style={style} activeOpacity={0.8} {...props} />
}