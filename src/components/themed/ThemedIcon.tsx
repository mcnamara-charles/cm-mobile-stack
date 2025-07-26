// components/themed/ThemedIcon.tsx
import React from 'react'
import { useTheme } from '../../context/themeContext'
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons'

type IconType = 'feather' | 'ionicons' | 'fontawesome'

type IconProps = {
  type?: IconType
  name: string
  size?: number
  color?: string
  style?: any
}

export const ThemedIcon = ({ type = 'feather', name, size = 24, color, style }: IconProps) => {
  const { theme } = useTheme()

  const resolvedColor = color ?? theme.colors.text

  const iconMap = {
    feather: Feather,
    ionicons: Ionicons,
    fontawesome: FontAwesome,
  }

  const IconComponent = iconMap[type]

  return <IconComponent name={name as any} size={size} color={resolvedColor} style={style} />
}
