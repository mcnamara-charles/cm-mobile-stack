import React from 'react'
import { Image, ImageProps } from 'react-native'

export const ThemedImage = ({ style, ...props }: ImageProps) => {
  return <Image style={style} {...props} />
}